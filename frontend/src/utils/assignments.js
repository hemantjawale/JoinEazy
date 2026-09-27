export const dateLabel = (date, options = {}) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...options,
  });
export function daysUntil(date) {
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const [year, month, day] = date.split('-').map(Number);
  return Math.round((Date.UTC(year, month - 1, day) - today) / 86400000);
}
export const isSubmitted = (assignment, submissions, studentId) =>
  submissions.some((item) => item.assignmentId === assignment.id && item.studentId === studentId);
export const statusOf = (assignment, submissions, studentId) =>
  isSubmitted(assignment, submissions, studentId)
    ? 'submitted'
    : daysUntil(assignment.dueDate) < 0
      ? 'overdue'
      : 'pending';
export const courseStyle = (course) => {
  if (/web|javascript/i.test(course)) return 'violet';
  if (/database|data/i.test(course)) return 'blue';
  if (/design|ux/i.test(course)) return 'orange';
  return 'green';
};
export const percent = (completed, total) => (total ? Math.round((completed / total) * 100) : 0);
