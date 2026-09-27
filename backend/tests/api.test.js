import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStore } from '../src/services/store.js';
import { createApp } from '../src/app.js';

let directory, server, base, store;
before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'joineazy-test-'));
  store = await createStore(join(directory, 'data.json'));
  server = createApp(store).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://localhost:${server.address().port}/api`;
});
after(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  await rm(directory, { recursive: true, force: true });
});
const api = (path, user = 'student-maya', method = 'GET', body) =>
  fetch(`${base}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Demo-User': user },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
const draft = {
  title: 'Test project',
  course: 'Testing',
  description: 'Demonstrate role-scoped CRUD.',
  dueDate: '2026-12-31',
  category: 'Project',
  driveUrl: 'https://drive.google.com/drive/folders/example',
  studentIds: ['student-maya'],
};

test('rejects missing identities and limits student data', async () => {
  assert.equal((await api('/workspace', 'unknown')).status, 401);
  const maya = await (await api('/workspace')).json();
  const alex = await (await api('/workspace', 'student-alex')).json();
  assert.ok(maya.submissions.every((item) => item.studentId === 'student-maya'));
  assert.equal(maya.students.length, 0);
  assert.ok(maya.assignments.every((item) => !('studentIds' in item)));
  assert.equal(
    alex.assignments.some((item) => item.id === 'a3'),
    false,
  );
});

test('professors only receive their own assignments and related submissions', async () => {
  for (const id of ['prof-sarah', 'prof-james']) {
    const data = await (await api('/workspace', id)).json();
    assert.ok(data.assignments.every((item) => item.ownerId === id));
    assert.ok(
      data.submissions.every((item) =>
        data.assignments.some((assignment) => assignment.id === item.assignmentId),
      ),
    );
  }
});

test('create, edit, persist and delete an assignment with ownership enforcement', async () => {
  assert.equal((await api('/assignments', 'student-maya', 'POST', draft)).status, 403);
  const response = await api('/assignments', 'prof-sarah', 'POST', draft);
  assert.equal(response.status, 201);
  const assignment = await response.json();
  assert.equal(
    (await api(`/assignments/${assignment.id}`, 'prof-james', 'PATCH', draft)).status,
    404,
  );
  assert.equal((await api(`/assignments/${assignment.id}`, 'prof-james', 'DELETE')).status, 404);
  const updated = { ...draft, title: 'Updated project' };
  assert.equal(
    (await api(`/assignments/${assignment.id}`, 'prof-sarah', 'PATCH', updated)).status,
    200,
  );
  const reopened = await createStore(join(directory, 'data.json'));
  assert.equal(
    reopened.read().assignments.find((item) => item.id === assignment.id).title,
    updated.title,
  );
  assert.equal((await api(`/assignments/${assignment.id}`, 'prof-sarah', 'DELETE')).status, 204);
  assert.equal(
    store.read().assignments.some((item) => item.id === assignment.id),
    false,
  );
});

test('validates links, dates, recipients and required fields', async () => {
  for (const change of [
    { driveUrl: 'javascript:alert(1)' },
    { driveUrl: 'https://drive.google.com.evil.test' },
    { dueDate: '2026-02-31' },
    { studentIds: [] },
    { studentIds: ['prof-sarah'] },
    { title: '   ' },
  ]) {
    assert.equal(
      (await api('/assignments', 'prof-sarah', 'POST', { ...draft, ...change })).status,
      400,
    );
  }
});

test('requires both confirmations, rejects unassigned students, and is idempotent', async () => {
  assert.equal(
    (await api('/assignments/a1/confirm', 'student-maya', 'POST', { confirmed: true })).status,
    400,
  );
  assert.equal(
    (
      await api('/assignments/a3/confirm', 'student-alex', 'POST', {
        confirmed: true,
        verified: true,
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await api('/assignments/a1/confirm', 'prof-sarah', 'POST', {
        confirmed: true,
        verified: true,
      })
    ).status,
    403,
  );
  for (let i = 0; i < 2; i++)
    assert.equal(
      (
        await api('/assignments/a1/confirm', 'student-maya', 'POST', {
          confirmed: true,
          verified: true,
        })
      ).status,
      200,
    );
  assert.equal(
    store
      .read()
      .submissions.filter((item) => item.assignmentId === 'a1' && item.studentId === 'student-maya')
      .length,
    1,
  );
});

test('removing a student removes their submission, deleting removes all related records', async () => {
  const response = await api('/assignments', 'prof-sarah', 'POST', {
    ...draft,
    studentIds: ['student-maya', 'student-alex'],
  });
  const assignment = await response.json();
  await api(`/assignments/${assignment.id}/confirm`, 'student-maya', 'POST', {
    confirmed: true,
    verified: true,
  });
  await api(`/assignments/${assignment.id}`, 'prof-sarah', 'PATCH', {
    ...draft,
    studentIds: ['student-alex'],
  });
  assert.equal(
    store.read().submissions.some((item) => item.assignmentId === assignment.id),
    false,
  );
  await api(`/assignments/${assignment.id}/confirm`, 'student-alex', 'POST', {
    confirmed: true,
    verified: true,
  });
  await api(`/assignments/${assignment.id}`, 'prof-sarah', 'DELETE');
  assert.equal(
    store.read().submissions.some((item) => item.assignmentId === assignment.id),
    false,
  );
});
