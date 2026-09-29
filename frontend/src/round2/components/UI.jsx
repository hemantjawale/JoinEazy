import {
  ArrowUpRight,
  BookOpen,
  Check,
  Code2,
  Database,
  GraduationCap,
  Layers,
  Palette,
  SearchX,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function Brand({ light = false }) {
  return (
    <Link to="/" className={`brand-v2 ${light ? 'light' : ''}`} aria-label="Joineazy home">
      <span>
        <GraduationCap size={25} strokeWidth={2} />
      </span>
      joineazy<i>.</i>
    </Link>
  );
}
export function Avatar({ person, size = '', className = '' }) {
  return (
    <span className={`avatar-v2 ${size} ${className}`} title={person?.name}>
      {person?.initials || '?'}
    </span>
  );
}
export function CourseIcon({ course, size = 25 }) {
  const Icon = { code: Code2, design: Palette, database: Database }[course?.icon] || Layers;
  return (
    <span className={`course-icon-v2 ${course?.color || 'lavender'}`}>
      <Icon size={size} strokeWidth={1.65} />
    </span>
  );
}
export function Progress({ value, label, color = '' }) {
  return (
    <div
      className={`progress-v2 ${color}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
export function Badge({ status, children }) {
  return (
    <span className={`badge-v2 ${status || ''}`}>
      {status === 'acknowledged' && <Check size={12} />}
      {children || { acknowledged: 'Acknowledged', pending: 'To do', overdue: 'Overdue' }[status]}
    </span>
  );
}
export function Empty({ title, text, action }) {
  return (
    <div className="empty-v2">
      <span>
        <SearchX size={29} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
export function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading-v2">
      <div>
        <div className="eyebrow-v2">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Loading() {
  return (
    <div className="loading-v2">
      <Brand />
      <div className="spinner-v2" />
      <p>A little clarity is on its way…</p>
    </div>
  );
}
export function CourseArtwork({ type = 'code' }) {
  return (
    <div className={`course-art ${type}`} aria-hidden="true">
      {type === 'code' ? (
        <>
          <div className="art-window">
            <span />
            <span />
            <span />
            <div>
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="art-code">{'</>'}</div>
        </>
      ) : type === 'design' ? (
        <>
          <div className="art-circles">
            <i />
            <i />
            <i />
          </div>
          <div className="art-pointer">
            <ArrowUpRight size={46} />
          </div>
        </>
      ) : (
        <>
          <div className="art-database">
            <i />
            <i />
            <i />
          </div>
          <div className="art-spark">✳</div>
        </>
      )}
    </div>
  );
}
export function MiniLabel({ children }) {
  return (
    <span className="mini-label">
      <BookOpen size={14} />
      {children}
    </span>
  );
}
