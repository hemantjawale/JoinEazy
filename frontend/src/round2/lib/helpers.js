export const percentage = (done, total) => (total ? Math.round((done / total) * 100) : 0);
export const dateTime = (value) =>
  new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
export const shortDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
export const statusOf = (assignment) =>
  assignment.acknowledgment
    ? 'acknowledged'
    : new Date(assignment.dueAt) < new Date()
      ? 'overdue'
      : 'pending';
export const myGroup = (workspace, courseId) =>
  workspace.groups.find(
    (group) => group.courseId === courseId && group.memberIds.includes(workspace.user.id),
  );
export const localDateInput = (value) => {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
export const initials = (name) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('');
