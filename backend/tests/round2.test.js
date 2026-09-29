import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../src/app.js';
import { createStore } from '../src/services/store.js';
import { seedWorkspace } from '../src/v2/seed.js';

let directory, server, base, store;
const sessions = {};
const api = (path, user, method = 'GET', body, extraHeaders = {}) =>
  fetch(`${base}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(sessions[user] ? { Cookie: sessions[user] } : {}),
      ...extraHeaders,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'joineazy-round2-'));
  const legacy = await createStore(join(directory, 'legacy.json'));
  store = await createStore(join(directory, 'round2.json'), seedWorkspace);
  server = createApp(legacy, { store, secret: 'test-secret-not-used-outside-tests' }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://localhost:${server.address().port}/api/v2`;
  for (const id of ['maya', 'arjun', 'rohan', 'ananya', 'vikram']) {
    const response = await api('/auth/demo', null, 'POST', { profile: id });
    sessions[id] = response.headers.get('set-cookie').split(';')[0];
  }
});
after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await rm(directory, { recursive: true, force: true });
});
const draft = {
  courseId: 'web',
  title: 'A thoughtful project',
  description: 'Build with care.',
  dueAt: '2026-10-15T18:00:00.000Z',
  submissionType: 'individual',
  oneDriveUrl: 'https://1drv.ms/f/example',
};

test('round 2: authenticates with JWT cookies, rejects invalid sessions and credentials', async () => {
  assert.equal((await api('/workspace')).status, 401);
  assert.equal(
    (await api('/workspace', null, 'GET', null, { Cookie: 'joineazy_session=forged' })).status,
    401,
  );
  assert.equal(
    (await api('/auth/login', null, 'POST', { email: 'maya@demo.joineazy.app', password: 'wrong' }))
      .status,
    401,
  );
  const login = await api('/auth/login', null, 'POST', {
    email: 'maya@demo.joineazy.app',
    password: 'LearnTogether26!',
  });
  assert.equal(login.status, 200);
  assert.match(login.headers.get('set-cookie'), /HttpOnly/);
  assert.match(login.headers.get('set-cookie'), /SameSite=Lax/);
  const body = await login.json();
  assert.equal(body.user.role, 'student');
  assert.equal('passwordHash' in body.user, false);
  const logout = await api('/auth/logout', 'maya', 'POST');
  assert.match(logout.headers.get('set-cookie'), /Expires=Thu, 01 Jan 1970/);
});

test('round 2: registration validates fields, rejects duplicates, and starts an empty workspace', async () => {
  assert.equal(
    (
      await api('/auth/register', null, 'POST', {
        name: 'Test',
        email: 'bad',
        password: '123',
        role: 'student',
      })
    ).status,
    400,
  );
  const user = {
    name: 'Neha Joshi',
    email: 'neha@example.test',
    password: 'ThoughtfulWork26!',
    role: 'student',
  };
  const response = await api('/auth/register', null, 'POST', user);
  assert.equal(response.status, 201);
  sessions.neha = response.headers.get('set-cookie').split(';')[0];
  const data = await (await api('/workspace', 'neha')).json();
  assert.equal(data.courses.length, 0);
  assert.equal((await api('/auth/register', null, 'POST', user)).status, 409);
  assert.equal((await api('/courses/join', 'neha', 'POST', { code: 'WEB204' })).status, 200);
  assert.equal((await (await api('/workspace', 'neha')).json()).courses[0].id, 'web');
});

test('round 2: professors only see their own courses; students never receive peer acknowledgment lists', async () => {
  const professor = await (await api('/workspace', 'ananya')).json();
  assert.ok(professor.courses.every((course) => course.professorId === 'ananya'));
  assert.equal(
    professor.assignments.some((item) => item.courseId === 'design'),
    false,
  );
  const student = await (await api('/workspace', 'maya')).json();
  assert.ok(student.assignments.every((assignment) => !('acknowledgments' in assignment)));
  assert.ok(student.people.every((person) => !('passwordHash' in person) && !('email' in person)));
});

test('round 2: assignment CRUD enforces course ownership and validates OneDrive links', async () => {
  assert.equal((await api('/assignments', 'maya', 'POST', draft)).status, 404);
  assert.equal((await api('/assignments', 'vikram', 'POST', draft)).status, 404);
  for (const oneDriveUrl of [
    'javascript:alert(1)',
    'https://1drv.ms.evil.test',
    'https://drive.google.com/file/x',
  ])
    assert.equal(
      (await api('/assignments', 'ananya', 'POST', { ...draft, oneDriveUrl })).status,
      400,
    );
  const response = await api('/assignments', 'ananya', 'POST', draft);
  assert.equal(response.status, 201);
  const assignment = await response.json();
  assert.equal((await api(`/assignments/${assignment.id}`, 'vikram', 'PATCH', draft)).status, 404);
  assert.equal(
    (
      await api(`/assignments/${assignment.id}`, 'ananya', 'PATCH', {
        ...draft,
        title: 'Updated with care',
      })
    ).status,
    200,
  );
  const disk = await createStore(join(directory, 'round2.json'), seedWorkspace);
  assert.equal(
    disk.read().assignments.find((item) => item.id === assignment.id).title,
    'Updated with care',
  );
  assert.equal((await api(`/assignments/${assignment.id}`, 'ananya', 'DELETE')).status, 204);
});

test('round 2: individual acknowledgment requires two confirmations and records timestamp once', async () => {
  assert.equal(
    (await api('/assignments/web-1/acknowledge', 'maya', 'POST', { confirmed: true })).status,
    400,
  );
  for (let index = 0; index < 2; index++)
    assert.equal(
      (
        await api('/assignments/web-1/acknowledge', 'maya', 'POST', {
          confirmed: true,
          verified: true,
        })
      ).status,
      200,
    );
  const records = store
    .read()
    .acknowledgments.filter((ack) => ack.assignmentId === 'web-1' && ack.studentId === 'maya');
  assert.equal(records.length, 1);
  assert.ok(Number.isFinite(Date.parse(records[0].acknowledgedAt)));
  const arjun = await (await api('/workspace', 'arjun')).json();
  assert.equal(arjun.assignments.find((item) => item.id === 'web-1').acknowledgment, null);
  assert.equal(
    (await api('/assignments/web-1', 'ananya', 'PATCH', { ...draft, submissionType: 'group' }))
      .status,
    409,
  );
});

test('round 2: only leader acknowledges group work and all members receive the same timestamp', async () => {
  const body = { confirmed: true, verified: true };
  assert.equal((await api('/assignments/web-2/acknowledge', 'rohan', 'POST', body)).status, 403);
  assert.equal((await api('/assignments/web-2/acknowledge', 'arjun', 'POST', body)).status, 403);
  assert.equal((await api('/assignments/web-2/acknowledge', 'ananya', 'POST', body)).status, 403);
  assert.equal((await api('/assignments/web-2/acknowledge', 'maya', 'POST', body)).status, 200);
  const maya = await (await api('/workspace', 'maya')).json();
  const arjun = await (await api('/workspace', 'arjun')).json();
  assert.deepEqual(
    maya.assignments.find((item) => item.id === 'web-2').acknowledgment,
    arjun.assignments.find((item) => item.id === 'web-2').acknowledgment,
  );
  assert.equal((await api('/groups/join', 'rohan', 'POST', { code: 'PIXEL26' })).status, 409);
  assert.equal((await api('/groups/pixel/membership', 'maya', 'DELETE')).status, 409);
});

test('round 2: create, join and leave course groups, one group per course', async () => {
  const response = await api('/groups', 'maya', 'POST', {
    courseId: 'design',
    name: 'The Curious Collective',
  });
  assert.equal(response.status, 201);
  const group = await response.json();
  assert.equal(
    (await api('/groups', 'maya', 'POST', { courseId: 'design', name: 'Second group' })).status,
    409,
  );
  assert.equal((await api('/groups/join', 'arjun', 'POST', { code: group.joinCode })).status, 200);
  assert.equal((await api('/groups/join', 'neha', 'POST', { code: group.joinCode })).status, 404);
  assert.equal((await api(`/groups/${group.id}/membership`, 'maya', 'DELETE')).status, 409);
  assert.equal((await api(`/groups/${group.id}/membership`, 'arjun', 'DELETE')).status, 204);
  assert.equal((await api(`/groups/${group.id}/membership`, 'maya', 'DELETE')).status, 204);
});

test('round 2: creates courses for their professor, enrollment uses invite codes, rejects foreign origins', async () => {
  assert.equal((await api('/courses', 'maya', 'POST', { title: 'No', code: 'NO' })).status, 403);
  const response = await api('/courses', 'ananya', 'POST', {
    title: 'Creative Computing',
    code: 'CS 300',
    color: 'blue',
  });
  assert.equal(response.status, 201);
  const course = await response.json();
  assert.equal(course.professorId, 'ananya');
  assert.equal((await api('/courses/join', 'maya', 'POST', { code: course.joinCode })).status, 200);
  assert.equal((await api('/courses/join', 'maya', 'POST', { code: 'invalid' })).status, 404);
  assert.equal(
    (
      await api(
        '/courses/join',
        'maya',
        'POST',
        { code: course.joinCode },
        { Origin: 'https://unknown.example' },
      )
    ).status,
    403,
  );
});
