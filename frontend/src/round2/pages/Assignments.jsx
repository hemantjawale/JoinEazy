import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCheck,
  Copy,
  Plus,
  Search,
  UserRound,
  Users,
} from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { Badge, CourseIcon, Empty, PageHeading, Progress } from '../components/UI';
import { dateTime, myGroup, percentage, statusOf } from '../lib/helpers';
import AssignmentForm from '../features/assignments/AssignmentForm';
import AssignmentDetails from '../features/assignments/AssignmentDetails';

export default function Assignments() {
  const { workspace, notify } = useSession();
  const { courseId } = useParams();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [format, setFormat] = useState('all');
  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState(null);
  const professor = workspace.user.role === 'professor';
  const course = workspace.courses.find((item) => item.id === courseId);
  if (courseId && !course)
    return (
      <Empty
        title="This course isn’t in your workspace."
        text="Join the course with an invite code or return to your courses."
        action={
          <Link className="btn-v2 primary" to="/app/courses">
            Back to courses
          </Link>
        }
      />
    );
  const assignments = workspace.assignments.filter(
    (item) => !courseId || item.courseId === courseId,
  );
  const filtered = assignments
    .filter(
      (item) =>
        `${item.title} ${workspace.courses.find((c) => c.id === item.courseId)?.title}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (format === 'all' || item.submissionType === format) &&
        (status === 'all' ||
          (professor
            ? status === 'acknowledged'
              ? item.expected > 0 && item.received === item.expected
              : item.received < item.expected || item.expected === 0
            : statusOf(item) === status)),
    )
    .sort(
      (a, b) =>
        Number(!!a.acknowledgment) - Number(!!b.acknowledgment) || a.dueAt.localeCompare(b.dueAt),
    );
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(course.joinCode);
      notify('Course invite code copied. Pass it on.');
    } catch {
      notify(`Course invite code: ${course.joinCode}`);
    }
  }
  return (
    <>
      {course && (
        <Link className="back-link-v2" to="/app/courses">
          <ArrowLeft size={15} />
          Back to my courses
        </Link>
      )}
      <PageHeading
        eyebrow={course ? `${course.code} · ${course.semester}` : 'A LITTLE FOCUS GOES A LONG WAY'}
        title={course ? course.title : 'Good work starts here.'}
        description={
          course ? course.description : 'Every brief, every deadline, every small step forward.'
        }
        action={
          professor &&
          workspace.courses.length > 0 && (
            <button className="btn-v2 primary" onClick={() => setEditor({})}>
              <Plus size={17} />
              Create assignment
            </button>
          )
        }
      />
      {course && (
        <div className="course-context-strip">
          <span>
            <Users size={16} />
            {course.studentIds.length} students
          </span>
          <span>{assignments.length} assignments</span>
          {professor ? (
            <button onClick={copyCode}>
              <Copy size={14} />
              Invite code: <strong>{course.joinCode}</strong>
            </button>
          ) : (
            <Link to={`/app/groups?course=${course.id}`}>
              <Users size={15} />
              {myGroup(workspace, course.id)?.name || 'Find your course group'}
              <ArrowUpRight size={14} />
            </Link>
          )}
        </div>
      )}
      <div className="assignment-controls-v2">
        <div className="status-tabs-v2" aria-label="Assignment filters">
          {[
            { id: 'all', label: 'All assignments' },
            { id: 'pending', label: professor ? 'Awaiting work' : 'To do' },
            { id: 'acknowledged', label: professor ? 'Complete' : 'Acknowledged' },
            ...(!professor ? [{ id: 'overdue', label: 'Overdue' }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              aria-pressed={status === tab.id}
              onClick={() => setStatus(tab.id)}
              className={status === tab.id ? 'active' : ''}
            >
              {tab.label}
              {tab.id === 'all' && <span>{assignments.length}</span>}
            </button>
          ))}
        </div>
        <div className="assignment-search-row">
          <label className="search-v2">
            <Search size={16} />
            <input
              aria-label="Search assignments"
              placeholder="Find an assignment…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select
            className="filter-select-v2"
            aria-label="Submission format filter"
            value={format}
            onChange={(event) => setFormat(event.target.value)}
          >
            <option value="all">All formats</option>
            <option value="individual">Individual</option>
            <option value="group">Group</option>
          </select>
        </div>
      </div>
      {filtered.length ? (
        <div className="assignments-grid-v2 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((assignment) => {
            const assignmentCourse = workspace.courses.find(
              (item) => item.id === assignment.courseId,
            );
            const group = myGroup(workspace, assignment.courseId);
            return (
              <article className="assignment-card-v2" key={assignment.id}>
                <div className="assignment-card-top">
                  <CourseIcon course={assignmentCourse} />
                  <Badge status={professor ? 'neutral' : statusOf(assignment)}>
                    {professor
                      ? assignment.submissionType === 'group'
                        ? 'Group'
                        : 'Individual'
                      : undefined}
                  </Badge>
                </div>
                <span className="assignment-course-label">
                  {assignmentCourse.code} · {assignmentCourse.title}
                </span>
                <h3>
                  <button onClick={() => setSelected(assignment)}>{assignment.title}</button>
                </h3>
                <p className="assignment-excerpt">{assignment.description}</p>
                <div className="assignment-format">
                  {assignment.submissionType === 'group' ? (
                    <Users size={14} />
                  ) : (
                    <UserRound size={14} />
                  )}
                  <span>
                    {assignment.submissionType === 'group'
                      ? 'Group assignment'
                      : 'Individual assignment'}
                  </span>
                  {!professor && assignment.submissionType === 'group' && (
                    <small>
                      {group
                        ? group.leaderId === workspace.user.id
                          ? 'You lead'
                          : 'Team member'
                        : 'Group needed'}
                    </small>
                  )}
                </div>
                {professor && (
                  <div className="assignment-progress-v2">
                    <div>
                      <span>Acknowledgments</span>
                      <strong>
                        {assignment.received}/{assignment.expected}
                      </strong>
                    </div>
                    <Progress
                      value={percentage(assignment.received, assignment.expected)}
                      label={`${assignment.title} acknowledgments`}
                    />
                  </div>
                )}
                <div className="assignment-card-footer">
                  <span>
                    <CalendarDays size={13} />
                    {dateTime(assignment.dueAt)}
                  </span>
                  <button
                    aria-label={`Open ${assignment.title}`}
                    onClick={() => setSelected(assignment)}
                  >
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <Empty
          title={assignments.length ? 'A little breathing room.' : 'Something good will go here.'}
          text={
            assignments.length
              ? 'No assignments match these filters. Try another view.'
              : professor
                ? 'Create a clear brief and give your students a place to start.'
                : 'Your professor hasn’t added assignments here yet.'
          }
          action={
            assignments.length ? (
              <button
                className="btn-v2 secondary"
                onClick={() => {
                  setQuery('');
                  setFormat('all');
                  setStatus('all');
                }}
              >
                Reset filters
              </button>
            ) : professor && workspace.courses.length > 0 ? (
              <button className="btn-v2 primary" onClick={() => setEditor({})}>
                Create assignment
              </button>
            ) : null
          }
        />
      )}
      <div className="list-caption-v2">
        <span>
          {filtered.length} of {assignments.length} assignments
        </span>
        <span>
          <CheckCheck size={13} />
          Small steps. Real progress.
        </span>
      </div>
      {selected && (
        <AssignmentDetails
          assignment={selected}
          onClose={() => setSelected(null)}
          onEdit={(item) => {
            setSelected(null);
            setEditor(item);
          }}
        />
      )}
      {editor && (
        <AssignmentForm
          assignment={editor.id ? editor : null}
          courseId={editor.courseId || courseId}
          onClose={() => setEditor(null)}
        />
      )}
    </>
  );
}
