import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCheck,
  Clock3,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { Avatar, Badge, CourseIcon, Empty, PageHeading, Progress } from '../components/UI';
import { percentage, shortDate } from '../lib/helpers';
import CourseCard from '../features/courses/CourseCard';
import CourseDialog from '../features/courses/CourseDialog';
import AssignmentDetails from '../features/assignments/AssignmentDetails';
import AssignmentForm from '../features/assignments/AssignmentForm';

export default function Dashboard() {
  const { workspace } = useSession();
  const { user, assignments, courses, groups } = workspace;
  const professor = user.role === 'professor';
  const [courseDialog, setCourseDialog] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState(null);
  const completed = professor
    ? assignments.reduce((sum, item) => sum + item.received, 0)
    : assignments.filter((item) => item.acknowledgment).length;
  const total = professor
    ? assignments.reduce((sum, item) => sum + item.expected, 0)
    : assignments.length;
  const upcoming = [...assignments]
    .filter((item) =>
      professor ? item.received < item.expected || item.expected === 0 : !item.acknowledgment,
    )
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
    .slice(0, 3);
  const myGroups = groups.filter((group) => professor || group.memberIds.includes(user.id));
  const stats = [
    {
      label: 'Courses this semester',
      value: courses.length,
      icon: BookOpen,
      color: 'lavender',
      hint: professor ? 'Your spaces to inspire' : 'A world to explore',
    },
    {
      label: professor ? 'Acknowledgments' : 'Acknowledged',
      value: completed,
      icon: CheckCheck,
      color: 'mint',
      hint: professor ? 'Progress, coming together' : 'Look how far you’ve come',
    },
    {
      label: 'Still in the making',
      value: Math.max(total - completed, 0),
      icon: Clock3,
      color: 'peach',
      hint: 'One step at a time',
    },
    {
      label: professor ? 'Course groups' : 'Your groups',
      value: myGroups.length,
      icon: Users,
      color: 'blue',
      hint: 'Better, together',
    },
  ];
  return (
    <>
      <PageHeading
        eyebrow={
          professor ? 'A LITTLE INSPIRATION GOES A LONG WAY' : 'MAKE A LITTLE ROOM FOR POSSIBILITY'
        }
        title={
          <>
            Hello, {user.name.split(' ')[0]} <span className="hello-sun">✦</span>
          </>
        }
        description={
          professor
            ? 'A clear view of your classroom. More space to help it grow.'
            : 'A fresh day. A little focus. Something good in the making.'
        }
        action={
          professor ? (
            <button className="btn-v2 primary" onClick={() => setCourseDialog(true)}>
              <Plus size={17} />
              Create course
            </button>
          ) : (
            <span className="date-chip">
              <CalendarDays size={15} />
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </span>
          )
        }
      />
      <section className="dashboard-welcome">
        <div>
          <span className="eyebrow-v2">
            <Sparkles size={13} />
            {professor ? 'EVERY CLASS HAS A LITTLE POTENTIAL' : 'YOUR NEXT CHAPTER IS TAKING SHAPE'}
          </span>
          <h2>
            {professor ? (
              <>
                Inspire a little.
                <br />
                Watch them grow.
              </>
            ) : (
              <>
                Big ideas start
                <br />
                with small steps.
              </>
            )}
          </h2>
          <p>
            {professor
              ? 'Bring clarity to your courses and celebrate every bit of progress.'
              : 'Your courses, your people, and your next great idea. All right here.'}
          </p>
          <Link to={professor ? '/app/progress' : '/app/assignments'}>
            {professor ? 'Explore class progress' : 'Find your next step'}
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <span className="welcome-art-star">✳</span>
          <div className="welcome-paper">
            <small>NOTE TO SELF</small>
            <strong>
              Keep going.
              <br />
              You’re growing.
            </strong>
            <div>
              <i />
              <i />
              <i />
            </div>
            <span>
              <CheckCheck size={24} />
            </span>
          </div>
          <div className="welcome-book">
            <span>one step at a time</span>
          </div>
          <span className="welcome-pencil" />
        </div>
        <div className="welcome-progress">
          <div
            className="dashboard-ring"
            style={{ '--progress': `${percentage(completed, total) * 3.6}deg` }}
          >
            <div>
              <strong>
                {percentage(completed, total)}
                <span>%</span>
              </strong>
              <small>acknowledged</small>
            </div>
          </div>
          <strong>
            {completed} of {total} {professor ? 'submissions' : 'assignments'}
          </strong>
          <span>A little progress adds up.</span>
        </div>
      </section>
      <div className="stats-v2 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, hint }) => (
          <div className="stat-v2" key={label}>
            <div>
              <span>{label}</span>
              <strong>{String(value).padStart(2, '0')}</strong>
              <small>{hint}</small>
            </div>
            <span className={`stat-v2-icon ${color}`}>
              <Icon size={20} />
            </span>
          </div>
        ))}
      </div>
      <div className="section-row">
        <div>
          <h2>
            Your courses <span>{courses.length}</span>
          </h2>
          <p>Different subjects. A world of possibilities.</p>
        </div>
        <Link className="text-link-v2" to="/app/courses">
          View all courses
          <ArrowRight size={15} />
        </Link>
      </div>
      {courses.length ? (
        <div className="course-grid-v2 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.slice(0, 3).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <Empty
          title="Let’s get your semester started."
          text={
            professor
              ? 'Create a course and make a home for your class.'
              : 'Ask your professor for a course invite code.'
          }
          action={
            <button className="btn-v2 primary" onClick={() => setCourseDialog(true)}>
              {professor ? 'Create a course' : 'Join a course'}
            </button>
          }
        />
      )}
      <div className="dashboard-bottom-grid">
        <section className="next-steps-panel">
          <div className="section-row">
            <div>
              <h2>Coming into focus</h2>
              <p>A few things to keep on your radar.</p>
            </div>
            <Clock3 size={19} />
          </div>
          {upcoming.length ? (
            upcoming.map((assignment) => {
              const course = courses.find((item) => item.id === assignment.courseId);
              return (
                <button
                  className="next-step-row"
                  key={assignment.id}
                  onClick={() => setSelected(assignment)}
                >
                  <CourseIcon course={course} size={20} />
                  <span>
                    <strong>{assignment.title}</strong>
                    <small>
                      {course.code} <i>·</i>{' '}
                      {assignment.submissionType === 'group' ? 'Group' : 'Individual'}
                    </small>
                  </span>
                  <span
                    className={`next-step-date ${new Date(assignment.dueAt) < new Date() ? 'late' : ''}`}
                  >
                    {shortDate(assignment.dueAt)}
                    <small>
                      {new Date(assignment.dueAt) < new Date() ? 'Overdue' : 'Due date'}
                    </small>
                  </span>
                  <ArrowUpRight size={15} />
                </button>
              );
            })
          ) : (
            <div className="calm-empty">
              <CheckCheck size={28} />
              <h3>A little breathing room.</h3>
              <p>
                {assignments.length
                  ? 'Everything is acknowledged. Nicely done.'
                  : 'Your next assignments will appear here.'}
              </p>
            </div>
          )}
        </section>
        <section className="together-panel">
          <span className="eyebrow-v2">
            <Users size={14} />
            BETTER, TOGETHER
          </span>
          <h3>{myGroups.length ? 'Your people are here.' : 'Find your kind of curious.'}</h3>
          <p>
            {myGroups.length
              ? 'Shared ideas. Different perspectives. One good place to start.'
              : 'Great projects begin with a conversation. Form or join a course group.'}
          </p>
          {myGroups[0] && (
            <div className="dashboard-group-preview">
              <div className="avatar-stack">
                {myGroups[0].memberIds.slice(0, 3).map((id) => (
                  <Avatar key={id} person={workspace.people.find((person) => person.id === id)} />
                ))}
              </div>
              <span>
                <strong>{myGroups[0].name}</strong>
                <small>{myGroups[0].memberIds.length} minds, one team</small>
              </span>
            </div>
          )}
          <Link to="/app/groups">
            {professor ? 'Explore course groups' : 'Meet your groups'}
            <ArrowUpRight size={16} />
          </Link>
        </section>
      </div>
      {courseDialog && <CourseDialog onClose={() => setCourseDialog(false)} />}
      {selected && (
        <AssignmentDetails
          assignment={selected}
          onClose={() => setSelected(null)}
          onEdit={(assignment) => {
            setSelected(null);
            setEditor(assignment);
          }}
        />
      )}
      {editor && (
        <AssignmentForm
          assignment={editor}
          courseId={editor.courseId}
          onClose={() => setEditor(null)}
        />
      )}
    </>
  );
}
