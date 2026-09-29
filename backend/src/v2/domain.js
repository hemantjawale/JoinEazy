import { HttpError } from '../services/assignments.js';
import { publicUser } from './security.js';

export const visibleCourses = (data, user) =>
  data.courses.filter((course) =>
    user.role === 'professor'
      ? course.professorId === user.id
      : course.studentIds.includes(user.id),
  );
export const groupFor = (data, courseId, studentId) =>
  data.groups.find((group) => group.courseId === courseId && group.memberIds.includes(studentId));
export function acknowledgmentFor(data, assignment, studentId) {
  const group = groupFor(data, assignment.courseId, studentId);
  return (
    data.acknowledgments.find(
      (ack) =>
        ack.assignmentId === assignment.id &&
        (assignment.submissionType === 'group'
          ? group && ack.groupId === group.id
          : ack.studentId === studentId),
    ) || null
  );
}
export function courseAccess(data, user, id, ownerOnly = false) {
  const course = visibleCourses(data, user).find((item) => item.id === id);
  if (!course || (ownerOnly && user.role !== 'professor'))
    throw new HttpError(404, 'Course not found.');
  return course;
}
export function assignmentFields(body) {
  const { title, description, dueAt, submissionType, oneDriveUrl = '' } = body;
  if (typeof title !== 'string' || !title.trim() || title.length > 120)
    throw new HttpError(400, 'Add a title of up to 120 characters.');
  if (typeof description !== 'string' || !description.trim() || description.length > 5000)
    throw new HttpError(400, 'Add a brief of up to 5,000 characters.');
  if (
    typeof dueAt !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T/.test(dueAt) ||
    !Number.isFinite(Date.parse(dueAt))
  )
    throw new HttpError(400, 'Choose a valid deadline with a date and time.');
  if (!['individual', 'group'].includes(submissionType))
    throw new HttpError(400, 'Choose individual or group submission.');
  if (typeof oneDriveUrl !== 'string' || oneDriveUrl.length > 2048)
    throw new HttpError(400, 'Enter a valid OneDrive URL.');
  if (oneDriveUrl) {
    try {
      const url = new URL(oneDriveUrl);
      if (
        url.protocol !== 'https:' ||
        url.username ||
        url.password ||
        !(
          ['1drv.ms', 'onedrive.live.com'].includes(url.hostname) ||
          url.hostname.endsWith('.sharepoint.com')
        )
      )
        throw new Error();
    } catch {
      throw new HttpError(400, 'Use a secure OneDrive or SharePoint sharing link.');
    }
  }
  return {
    title: title.trim(),
    description: description.trim(),
    dueAt: new Date(dueAt).toISOString(),
    submissionType,
    oneDriveUrl,
  };
}
export function workspaceFor(data, user) {
  const courses = visibleCourses(data, user);
  const ids = new Set(courses.map((course) => course.id));
  const groups = data.groups.filter((group) => ids.has(group.courseId));
  const peerIds = new Set(courses.flatMap((course) => [...course.studentIds, course.professorId]));
  const people = data.users
    .filter((person) => peerIds.has(person.id))
    .map(({ id, name, initials, role }) => ({ id, name, initials, role }));
  const assignments = data.assignments
    .filter((assignment) => ids.has(assignment.courseId))
    .map((assignment) => {
      const course = courses.find((item) => item.id === assignment.courseId);
      const records = data.acknowledgments.filter((ack) => ack.assignmentId === assignment.id);
      const targets =
        assignment.submissionType === 'group'
          ? groups.filter((group) => group.courseId === assignment.courseId)
          : course.studentIds;
      const myGroup = groupFor(data, assignment.courseId, user.id);
      return {
        ...assignment,
        received: records.length,
        expected: targets.length,
        acknowledgment:
          user.role === 'student' ? acknowledgmentFor(data, assignment, user.id) : null,
        canAcknowledge:
          user.role === 'student' &&
          (assignment.submissionType === 'individual' || myGroup?.leaderId === user.id),
        ...(user.role === 'professor' ? { acknowledgments: records } : {}),
      };
    });
  return { user: publicUser(user), courses, assignments, groups, people };
}
