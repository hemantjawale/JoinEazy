import { Router } from 'express';
import { randomBytes, randomUUID } from 'node:crypto';
import { HttpError } from '../services/assignments.js';
import {
  hashPassword,
  verifyPassword,
  publicUser,
  sessionToken,
  verifyToken,
  readCookie,
  SESSION_COOKIE,
  cookieOptions,
} from './security.js';
import {
  courseAccess,
  assignmentFields,
  workspaceFor,
  groupFor,
  acknowledgmentFor,
} from './domain.js';

export function createV2Api(store, secret) {
  const router = Router();
  const attempts = new Map();
  router.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    if (
      ['POST', 'PATCH'].includes(req.method) &&
      req.path !== '/auth/logout' &&
      (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))
    )
      throw new HttpError(400, 'Send a JSON object with the request details.');
    next();
  });
  router.use((req, _res, next) => {
    const origin = req.get('origin');
    const allowed = [
      process.env.APP_ORIGIN,
      'http://localhost:5173',
      'http://localhost:3001',
      `http://${req.get('host')}`,
      `https://${req.get('host')}`,
    ].filter(Boolean);
    if (origin && !allowed.includes(origin))
      throw new HttpError(403, 'This origin is not allowed.');
    next();
  });
  router.use('/auth', (req, _res, next) => {
    if (req.method !== 'POST' || req.path === '/logout') return next();
    const key = req.ip;
    const now = Date.now();
    const entry = attempts.get(key);
    if (!entry || entry.until < now) attempts.set(key, { count: 1, until: now + 60000 });
    else if (++entry.count > 30)
      throw new HttpError(429, 'Too many attempts. Try again in a minute.');
    if (attempts.size > 10000)
      for (const [ip, record] of attempts) if (record.until < now) attempts.delete(ip);
    next();
  });
  const signIn = (res, user) => {
    res.cookie(SESSION_COOKIE, sessionToken(user, secret), {
      ...cookieOptions,
      maxAge: 8 * 60 * 60 * 1000,
    });
    res.json({ user: publicUser(user) });
  };
  router.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string' || password.length > 128)
      throw new HttpError(400, 'Enter your email and password.');
    const user = store.read().users.find((item) => item.email === email.trim().toLowerCase());
    if (!user || !verifyPassword(password, user.passwordHash))
      throw new HttpError(401, 'That email and password don’t match. Please try again.');
    signIn(res, user);
  });
  router.post('/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    if (typeof name !== 'string' || name.trim().length < 2 || name.length > 80)
      throw new HttpError(400, 'Enter your full name (2–80 characters).');
    if (
      typeof email !== 'string' ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    )
      throw new HttpError(400, 'Enter a valid email address.');
    if (typeof password !== 'string' || password.length < 8 || password.length > 128)
      throw new HttpError(400, 'Use a password of 8–128 characters.');
    if (!['student', 'professor'].includes(role)) throw new HttpError(400, 'Choose your role.');
    const user = {
      id: randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      passwordHash: hashPassword(password),
      initials: name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join(''),
    };
    await store.mutate((data) => {
      if (data.users.some((item) => item.email === user.email))
        throw new HttpError(409, 'An account with this email already exists. Sign in instead.');
      data.users.push(user);
    });
    signIn(res.status(201), user);
  });
  router.post('/auth/demo', (req, res) => {
    if (process.env.DEMO_ENABLED === 'false')
      throw new HttpError(403, 'Demo accounts are disabled.');
    if (!['maya', 'arjun', 'rohan', 'ananya', 'vikram'].includes(req.body.profile))
      throw new HttpError(400, 'Choose a demo profile.');
    signIn(
      res,
      store.read().users.find((user) => user.id === req.body.profile),
    );
  });
  router.post('/auth/logout', (_req, res) => {
    res.clearCookie(SESSION_COOKIE, cookieOptions);
    res.status(204).end();
  });
  router.use((req, _res, next) => {
    try {
      const token = readCookie(req);
      const claims = verifyToken(token, secret);
      req.user = store.read().users.find((user) => user.id === claims.sub);
      if (!req.user) throw new Error();
    } catch {
      throw new HttpError(401, 'Your session has ended. Please sign in again.');
    }
    next();
  });
  router.get('/workspace', (req, res) => res.json(workspaceFor(store.read(), req.user)));
  router.post('/courses', async (req, res) => {
    if (req.user.role !== 'professor')
      throw new HttpError(403, 'Only professors can create courses.');
    const { title, code, description = '', color = 'lavender' } = req.body;
    if (
      typeof title !== 'string' ||
      title.trim().length < 3 ||
      title.length > 80 ||
      typeof code !== 'string' ||
      !code.trim() ||
      code.length > 16 ||
      typeof description !== 'string' ||
      description.length > 300 ||
      !['lavender', 'peach', 'mint', 'blue'].includes(color)
    )
      throw new HttpError(400, 'Add a course title, short code, and valid details.');
    const course = {
      id: randomUUID(),
      title: title.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
      color,
      icon: 'code',
      professorId: req.user.id,
      studentIds: [],
      semester: 'Autumn 2026',
      joinCode: randomBytes(4).toString('hex').toUpperCase(),
    };
    await store.mutate((data) => {
      data.courses.push(course);
    });
    res.status(201).json(course);
  });
  router.post('/courses/join', async (req, res) => {
    if (req.user.role !== 'student') throw new HttpError(403, 'Only students can enroll.');
    await store.mutate((data) => {
      const course = data.courses.find(
        (item) =>
          item.joinCode ===
          String(req.body.code || '')
            .trim()
            .toUpperCase(),
      );
      if (!course) throw new HttpError(404, 'Course code not found. Check it with your professor.');
      if (!course.studentIds.includes(req.user.id)) course.studentIds.push(req.user.id);
    });
    res.json({ success: true });
  });
  router.post('/assignments', async (req, res) => {
    const fields = assignmentFields(req.body);
    const assignment = {
      ...fields,
      id: randomUUID(),
      courseId: req.body.courseId,
      createdAt: new Date().toISOString(),
    };
    await store.mutate((data) => {
      courseAccess(data, req.user, assignment.courseId, true);
      data.assignments.push(assignment);
    });
    res.status(201).json(assignment);
  });
  router.patch('/assignments/:id', async (req, res) => {
    const fields = assignmentFields(req.body);
    await store.mutate((data) => {
      const assignment = data.assignments.find((item) => item.id === req.params.id);
      if (!assignment) throw new HttpError(404, 'Assignment not found.');
      courseAccess(data, req.user, assignment.courseId, true);
      if (
        assignment.submissionType !== fields.submissionType &&
        data.acknowledgments.some((ack) => ack.assignmentId === assignment.id)
      )
        throw new HttpError(409, 'Submission type cannot change after an acknowledgment.');
      Object.assign(assignment, fields);
    });
    res.json({ success: true });
  });
  router.delete('/assignments/:id', async (req, res) => {
    await store.mutate((data) => {
      const assignment = data.assignments.find((item) => item.id === req.params.id);
      if (!assignment) throw new HttpError(404, 'Assignment not found.');
      courseAccess(data, req.user, assignment.courseId, true);
      data.assignments = data.assignments.filter((item) => item.id !== assignment.id);
      data.acknowledgments = data.acknowledgments.filter(
        (ack) => ack.assignmentId !== assignment.id,
      );
    });
    res.status(204).end();
  });
  router.post('/assignments/:id/acknowledge', async (req, res) => {
    if (req.user.role !== 'student')
      throw new HttpError(403, 'Only students can acknowledge work.');
    if (req.body.confirmed !== true || req.body.verified !== true)
      throw new HttpError(400, 'Complete both acknowledgment steps.');
    await store.mutate((data) => {
      const assignment = data.assignments.find((item) => item.id === req.params.id);
      if (!assignment) throw new HttpError(404, 'Assignment not found.');
      courseAccess(data, req.user, assignment.courseId);
      const group = groupFor(data, assignment.courseId, req.user.id);
      if (assignment.submissionType === 'group' && (!group || group.leaderId !== req.user.id))
        throw new HttpError(403, 'Only your group leader can acknowledge this assignment.');
      if (acknowledgmentFor(data, assignment, req.user.id)) return;
      data.acknowledgments.push({
        id: randomUUID(),
        assignmentId: assignment.id,
        actorId: req.user.id,
        acknowledgedAt: new Date().toISOString(),
        ...(assignment.submissionType === 'group'
          ? { groupId: group.id }
          : { studentId: req.user.id }),
      });
    });
    res.json({ success: true });
  });
  router.post('/groups', async (req, res) => {
    if (req.user.role !== 'student') throw new HttpError(403, 'Only students can create groups.');
    const { courseId, name } = req.body;
    if (typeof name !== 'string' || name.trim().length < 2 || name.length > 50)
      throw new HttpError(400, 'Give your group a name (2–50 characters).');
    const group = {
      id: randomUUID(),
      courseId,
      name: name.trim(),
      leaderId: req.user.id,
      memberIds: [req.user.id],
      joinCode: randomBytes(3).toString('hex').toUpperCase(),
    };
    await store.mutate((data) => {
      courseAccess(data, req.user, courseId);
      if (groupFor(data, courseId, req.user.id))
        throw new HttpError(409, 'You already have a group in this course.');
      data.groups.push(group);
    });
    res.status(201).json(group);
  });
  router.post('/groups/join', async (req, res) => {
    if (req.user.role !== 'student') throw new HttpError(403, 'Only students can join groups.');
    await store.mutate((data) => {
      const group = data.groups.find(
        (item) =>
          item.joinCode ===
          String(req.body.code || '')
            .trim()
            .toUpperCase(),
      );
      if (!group)
        throw new HttpError(
          404,
          'Group code not found. Ask your group leader for the invite code.',
        );
      if (req.body.courseId && req.body.courseId !== group.courseId)
        throw new HttpError(
          400,
          'That invite code belongs to a different course. Choose the matching course first.',
        );
      courseAccess(data, req.user, group.courseId);
      if (groupFor(data, group.courseId, req.user.id))
        throw new HttpError(409, 'You already belong to a group in this course.');
      if (group.memberIds.length >= 5) throw new HttpError(409, 'This group is full (5 members).');
      if (data.acknowledgments.some((ack) => ack.groupId === group.id))
        throw new HttpError(
          409,
          'This group has already acknowledged work and its membership is locked.',
        );
      group.memberIds.push(req.user.id);
    });
    res.json({ success: true });
  });
  router.delete('/groups/:id/membership', async (req, res) => {
    await store.mutate((data) => {
      const group = data.groups.find(
        (item) => item.id === req.params.id && item.memberIds.includes(req.user.id),
      );
      if (!group) throw new HttpError(404, 'Group not found.');
      if (data.acknowledgments.some((ack) => ack.groupId === group.id))
        throw new HttpError(409, 'Membership is locked after a group acknowledgment.');
      if (group.leaderId === req.user.id && group.memberIds.length > 1)
        throw new HttpError(409, 'A leader can leave only when the other members have left.');
      group.memberIds = group.memberIds.filter((id) => id !== req.user.id);
      if (!group.memberIds.length) data.groups = data.groups.filter((item) => item.id !== group.id);
    });
    res.status(204).end();
  });
  router.use((_req, res) => res.status(404).json({ message: 'API route not found.' }));
  return router;
}
