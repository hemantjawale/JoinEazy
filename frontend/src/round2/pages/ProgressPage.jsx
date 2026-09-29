import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCheck, TrendingUp } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { Avatar, Badge, CourseIcon, Empty, PageHeading, Progress } from '../components/UI';
import { percentage, statusOf } from '../lib/helpers';

export default function ProgressPage() {
  const { workspace } = useSession();
  const professor = workspace.user.role === 'professor';
  function studentAck(assignment, id) {
    const group = workspace.groups.find(
      (item) => item.courseId === assignment.courseId && item.memberIds.includes(id),
    );
    return assignment.acknowledgments?.some((ack) =>
      assignment.submissionType === 'individual'
        ? ack.studentId === id
        : group && ack.groupId === group.id,
    );
  }
  return (
    <>
      <PageHeading
        eyebrow="SMALL STEPS ADD UP"
        title={professor ? 'Every student. Every step.' : 'Look how far you’ve come.'}
        description={
          professor
            ? 'See each student’s progress across the courses you teach.'
            : 'The bigger picture, one checkmark at a time.'
        }
      />
      {workspace.courses.length ? (
        <div className="progress-courses-v2 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {workspace.courses.map((course) => {
            const assignments = workspace.assignments.filter((item) => item.courseId === course.id);
            const done = professor
              ? assignments.reduce((sum, item) => sum + item.received, 0)
              : assignments.filter((item) => item.acknowledgment).length;
            const total = professor
              ? assignments.reduce((sum, item) => sum + item.expected, 0)
              : assignments.length;
            return (
              <section className="progress-course-v2" key={course.id}>
                <div className="progress-course-heading">
                  <CourseIcon course={course} />
                  <div>
                    <span>{course.code}</span>
                    <h2>{course.title}</h2>
                  </div>
                  <Link aria-label={`Open ${course.title}`} to={`/app/courses/${course.id}`}>
                    <ArrowUpRight size={20} />
                  </Link>
                </div>
                <div className="progress-big-value">
                  <strong>
                    {percentage(done, total)}
                    <span>%</span>
                  </strong>
                  <p>
                    {done} of {total} {professor ? 'submissions' : 'assignments'} acknowledged
                  </p>
                </div>
                <Progress
                  value={percentage(done, total)}
                  label={`${course.title} completion`}
                  color={course.color}
                />
                {professor ? (
                  <div className="student-progress-list-v2">
                    {course.studentIds.length ? (
                      course.studentIds.map((id) => {
                        const person = workspace.people.find((item) => item.id === id);
                        const completed = assignments.filter((assignment) =>
                          studentAck(assignment, id),
                        ).length;
                        return (
                          <div className="student-progress-item-v2" key={id}>
                            <div>
                              <Avatar person={person} size="tiny" />
                              <strong>{person?.name}</strong>
                              <span>
                                {completed}/{assignments.length}
                              </span>
                            </div>
                            <Progress
                              value={percentage(completed, assignments.length)}
                              label={`${person?.name} ${course.title} progress`}
                            />
                            <small>{percentage(completed, assignments.length)}% acknowledged</small>
                          </div>
                        );
                      })
                    ) : (
                      <p className="field-note">Invite your students to see their progress here.</p>
                    )}
                  </div>
                ) : (
                  <div className="progress-assignment-list">
                    {assignments.length ? (
                      assignments.map((assignment) => (
                        <Link key={assignment.id} to={`/app/courses/${course.id}`}>
                          <span>
                            {assignment.acknowledgment ? (
                              <CheckCheck size={17} />
                            ) : (
                              <span className="progress-open-dot" />
                            )}
                          </span>
                          <strong>{assignment.title}</strong>
                          <Badge status={statusOf(assignment)} />
                        </Link>
                      ))
                    ) : (
                      <p className="field-note">Your next assignments will appear here.</p>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <Empty
          title="A new beginning looks good on you."
          text="Your progress will take shape as your courses and assignments grow."
          action={
            <Link className="btn-v2 primary" to="/app/courses">
              Explore courses
              <ArrowUpRight size={15} />
            </Link>
          }
        />
      )}
      <div className="progress-note">
        <TrendingUp size={22} />
        <p>Progress is more than a percentage. But every little step is worth noticing.</p>
      </div>
    </>
  );
}
