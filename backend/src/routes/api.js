import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { users } from '../data/seed.js';
import { HttpError, visibleAssignments, validateAssignment } from '../services/assignments.js';

export function createApi(store) {
  const router = Router();
  // Explicit demo identity selection, not production authentication.
  router.get('/demo-users', (_req, res) => res.json(users));
  router.use((req, _res, next) => {
    req.user = users.find((user) => user.id === req.get('X-Demo-User'));
    if (!req.user) throw new HttpError(401, 'Select a demo profile to continue.');
    next();
  });
  router.get('/workspace', (req, res) => {
    const data = store.read();
    const assignments = visibleAssignments(data, req.user);
    const ids = new Set(assignments.map((assignment) => assignment.id));
    const submissions = data.submissions.filter(
      (submission) =>
        ids.has(submission.assignmentId) &&
        (req.user.role === 'admin' || submission.studentId === req.user.id),
    );
    const students =
      req.user.role === 'admin' ? users.filter((user) => user.role === 'student') : [];
    res.json({
      user: req.user,
      assignments: assignments.map((assignment) =>
        req.user.role === 'student'
          ? {
              ...assignment,
              studentIds: undefined,
              professor: users.find((user) => user.id === assignment.ownerId).name,
            }
          : assignment,
      ),
      submissions,
      students,
    });
  });
  const adminOnly = (req, _res, next) => {
    if (req.user.role !== 'admin')
      throw new HttpError(403, 'Only professors can manage assignments.');
    next();
  };
  router.post('/assignments', adminOnly, async (req, res) => {
    const fields = validateAssignment(req.body);
    const assignment = {
      ...fields,
      id: randomUUID(),
      ownerId: req.user.id,
      createdAt: new Date().toISOString(),
    };
    await store.mutate((data) => {
      data.assignments.push(assignment);
    });
    res.status(201).json(assignment);
  });
  router.patch('/assignments/:id', adminOnly, async (req, res) => {
    const fields = validateAssignment(req.body);
    await store.mutate((data) => {
      const assignment = data.assignments.find(
        (item) => item.id === req.params.id && item.ownerId === req.user.id,
      );
      if (!assignment) throw new HttpError(404, 'Assignment not found.');
      Object.assign(assignment, fields);
      data.submissions = data.submissions.filter(
        (submission) =>
          submission.assignmentId !== assignment.id ||
          fields.studentIds.includes(submission.studentId),
      );
    });
    res.json({ success: true });
  });
  router.delete('/assignments/:id', adminOnly, async (req, res) => {
    await store.mutate((data) => {
      const assignment = data.assignments.find(
        (item) => item.id === req.params.id && item.ownerId === req.user.id,
      );
      if (!assignment) throw new HttpError(404, 'Assignment not found.');
      data.assignments = data.assignments.filter((item) => item.id !== assignment.id);
      data.submissions = data.submissions.filter((item) => item.assignmentId !== assignment.id);
    });
    res.status(204).end();
  });
  router.post('/assignments/:id/confirm', async (req, res) => {
    if (req.user.role !== 'student')
      throw new HttpError(403, 'Only students can confirm submissions.');
    if (req.body.confirmed !== true || req.body.verified !== true)
      throw new HttpError(400, 'Complete both confirmation steps.');
    await store.mutate((data) => {
      const assignment = visibleAssignments(data, req.user).find(
        (item) => item.id === req.params.id,
      );
      if (!assignment) throw new HttpError(404, 'Assignment not found.');
      if (
        !data.submissions.some(
          (item) => item.assignmentId === assignment.id && item.studentId === req.user.id,
        )
      )
        data.submissions.push({
          assignmentId: assignment.id,
          studentId: req.user.id,
          submittedAt: new Date().toISOString(),
        });
    });
    res.json({ success: true });
  });
  return router;
}
