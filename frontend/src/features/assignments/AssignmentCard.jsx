import {
  ArrowUpRight,
  CalendarDays,
  CheckCheck,
  Code2,
  Database,
  Layers,
  Palette,
  Users,
} from 'lucide-react';
import { courseStyle, dateLabel, daysUntil, percent, statusOf } from '../../utils/assignments';
import ProgressBar from '../../components/ProgressBar';

const icons = { violet: Code2, blue: Database, orange: Palette, green: Layers };
export default function AssignmentCard({ assignment, submissions, user, onOpen }) {
  const admin = user.role === 'admin';
  const tone = courseStyle(assignment.course);
  const Icon = icons[tone];
  const status = admin ? null : statusOf(assignment, submissions, user.id);
  const received = submissions.filter((item) => item.assignmentId === assignment.id).length;
  const days = daysUntil(assignment.dueDate);
  return (
    <article className={`assignment-card ${status === 'submitted' ? 'completed-card' : ''}`}>
      <div className="card-top">
        <span className={`course-icon ${tone}`}>
          <Icon size={21} strokeWidth={1.7} />
        </span>
        {admin ? (
          <span className="badge neutral">{assignment.category}</span>
        ) : (
          <span className={`badge ${status}`}>
            {status === 'submitted' && <CheckCheck size={13} />}
            {status === 'submitted' ? 'Submitted' : status === 'overdue' ? 'Overdue' : 'To do'}
          </span>
        )}
      </div>
      <span className={`course-name ${tone}`}>{assignment.course}</span>
      <h3>
        <button onClick={() => onOpen(assignment)}>{assignment.title}</button>
      </h3>
      <p className="card-description">{assignment.description}</p>
      {admin ? (
        <div className="card-submission">
          <div>
            <span>
              <Users size={13} />
              Submissions
            </span>
            <strong>
              {received}/{assignment.studentIds.length}
            </strong>
          </div>
          <ProgressBar
            value={percent(received, assignment.studentIds.length)}
            label={`${assignment.title} submissions`}
          />
        </div>
      ) : (
        <div className="card-meta">
          <span>{assignment.category}</span>
          <span className="meta-dot">·</span>
          <span>
            {assignment.professor
              ?.split(' ')
              .map((part, index) => (index ? part : `${part[0]}.`))
              .join(' ')}
          </span>
        </div>
      )}
      <div className="card-footer">
        <span className={`due-label ${status === 'overdue' ? 'late' : ''}`}>
          <CalendarDays size={14} />
          {dateLabel(assignment.dueDate)}
          {days === 0 && status !== 'submitted' ? ' · Today' : ''}
        </span>
        <button className="card-action" onClick={() => onOpen(assignment)}>
          {admin ? 'Manage' : status === 'submitted' ? 'View details' : 'View assignment'}
          <ArrowUpRight size={15} />
        </button>
      </div>
    </article>
  );
}
