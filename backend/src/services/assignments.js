import { users } from '../data/seed.js';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function visibleAssignments(data, user) {
  return data.assignments.filter((assignment) =>
    user.role === 'admin'
      ? assignment.ownerId === user.id
      : assignment.studentIds.includes(user.id),
  );
}

export function validateAssignment(body) {
  const { title, course, description, dueDate, driveUrl = '', category, studentIds } = body;
  if (
    ![title, course, description, dueDate, driveUrl, category].every(
      (value) => typeof value === 'string',
    )
  )
    throw new HttpError(400, 'Please fill in all required fields.');
  if (
    !title.trim() ||
    title.length > 120 ||
    !course.trim() ||
    course.length > 80 ||
    !description.trim() ||
    description.length > 5000
  )
    throw new HttpError(400, 'Add a title, course, and description within the character limits.');
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) ||
    Number.isNaN(Date.parse(dueDate)) ||
    new Date(dueDate).toISOString().slice(0, 10) !== dueDate
  )
    throw new HttpError(400, 'Choose a valid due date.');
  if (!['Project', 'Assignment', 'Case study', 'Exercise'].includes(category))
    throw new HttpError(400, 'Choose a valid assignment type.');
  if (driveUrl) {
    try {
      const url = new URL(driveUrl);
      if (
        url.protocol !== 'https:' ||
        !['drive.google.com', 'docs.google.com'].includes(url.hostname) ||
        url.username ||
        url.password
      )
        throw new Error();
    } catch {
      throw new HttpError(400, 'Use a secure Google Drive or Google Docs link.');
    }
  }
  const studentSet = new Set(
    users.filter((user) => user.role === 'student').map((user) => user.id),
  );
  if (
    !Array.isArray(studentIds) ||
    !studentIds.length ||
    !studentIds.every((id) => studentSet.has(id))
  )
    throw new HttpError(400, 'Choose at least one student.');
  return {
    title: title.trim(),
    course: course.trim(),
    description: description.trim(),
    dueDate,
    driveUrl,
    category,
    studentIds: [...new Set(studentIds)],
  };
}
