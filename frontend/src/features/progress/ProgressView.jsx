import { BookOpen, CheckCheck } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { courseStyle, isSubmitted, percent } from '../../utils/assignments';
import ProgressBar from '../../components/ProgressBar';
import EmptyState from '../../components/EmptyState';

export default function ProgressView({ onOpen }) {
  const {
    workspace: { assignments, submissions, user, students },
  } = useWorkspace();
  if (user.role === 'admin')
    return (
      <section className="progress-section">
        <div className="section-heading">
          <div>
            <h2>Every student. Every step.</h2>
            <p>Individual progress across assignments you created.</p>
          </div>
          <span className="badge neutral">{students.length} students</span>
        </div>
        <div className="student-grid">
          {students.map((student) => {
            const assigned = assignments.filter((item) => item.studentIds.includes(student.id));
            const completed = assigned.filter((item) =>
              isSubmitted(item, submissions, student.id),
            ).length;
            return (
              <article className="student-progress-card" key={student.id}>
                <div className="student-heading">
                  <span className="avatar large">{student.initials}</span>
                  <div>
                    <h3>{student.name}</h3>
                    <p>{student.program}</p>
                  </div>
                </div>
                <div className="progress-label">
                  <span>Assignment completion</span>
                  <strong>{percent(completed, assigned.length)}%</strong>
                </div>
                <ProgressBar
                  value={percent(completed, assigned.length)}
                  label={`${student.name} completion`}
                />
                <p className="progress-caption">
                  {completed} of {assigned.length} submitted
                </p>
                <div className="student-assignment-list">
                  {assigned.length ? (
                    assigned.map((assignment) => (
                      <button key={assignment.id} onClick={() => onOpen(assignment)}>
                        <span>{assignment.title}</span>
                        <span
                          className={`status-dot ${isSubmitted(assignment, submissions, student.id) ? 'done' : ''}`}
                        />
                        <small>
                          {isSubmitted(assignment, submissions, student.id)
                            ? 'Submitted'
                            : 'Not submitted'}
                        </small>
                      </button>
                    ))
                  ) : (
                    <p>No assignments for this student yet.</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  const courses = [...new Set(assignments.map((item) => item.course))];
  return (
    <section className="progress-section">
      <div className="section-heading">
        <div>
          <h2>A little better, every day</h2>
          <p>See how far you’ve come in each of your courses.</p>
        </div>
      </div>
      {courses.length ? (
        <div className="course-progress-grid">
          {courses.map((course) => {
            const items = assignments.filter((item) => item.course === course);
            const completed = items.filter((item) =>
              isSubmitted(item, submissions, user.id),
            ).length;
            return (
              <article className="course-progress-card" key={course}>
                <span className={`course-icon ${courseStyle(course)}`}>
                  <BookOpen size={22} />
                </span>
                <h3>{course}</h3>
                <div className="progress-label">
                  <span>
                    {completed} of {items.length} completed
                  </span>
                  <strong>{percent(completed, items.length)}%</strong>
                </div>
                <ProgressBar
                  value={percent(completed, items.length)}
                  label={`${course} completion`}
                />
                <div className="student-assignment-list">
                  {items.map((assignment) => (
                    <button key={assignment.id} onClick={() => onOpen(assignment)}>
                      <span>{assignment.title}</span>
                      {isSubmitted(assignment, submissions, user.id) ? (
                        <CheckCheck size={17} className="text-emerald-600" />
                      ) : (
                        <span className="status-dot" />
                      )}
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Your journey starts here"
          description="Your progress will appear when your professor adds assignments."
        />
      )}
    </section>
  );
}
