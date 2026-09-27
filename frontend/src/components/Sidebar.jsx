import {
  ArrowUpRight,
  BookOpen,
  ChartNoAxesCombined,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

export default function Sidebar({ user, view, setView, open, onClose, onHelp }) {
  const admin = user.role === 'admin';
  const items = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'assignments', label: 'Assignments', icon: BookOpen },
    {
      id: 'progress',
      label: admin ? 'Student progress' : 'My progress',
      icon: admin ? Users : ChartNoAxesCombined,
    },
  ];
  return (
    <>
      {open && (
        <button
          className="sidebar-overlay lg:hidden"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <a
          href="#overview"
          className="brand"
          onClick={(event) => {
            event.preventDefault();
            setView('overview');
            onClose();
          }}
        >
          <span className="brand-mark">
            <GraduationCap size={25} strokeWidth={2.2} />
          </span>
          joineazy<span className="brand-dot">.</span>
        </a>
        <button
          className="icon-button mobile-sidebar-close lg:hidden"
          aria-label="Close navigation"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <nav aria-label="Main navigation">
          {items.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${view === id ? 'active' : ''}`}
              aria-current={view === id ? 'page' : undefined}
              onClick={() => {
                setView(id);
                onClose();
              }}
            >
              <Icon size={19} strokeWidth={1.7} />
              <span>{label}</span>
              {view === id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Sparkles size={21} />
            <h3>
              Small steps.
              <br />
              Big possibilities.
            </h3>
            <p>
              A little progress every day
              <br />
              goes a long way.
            </p>
            <span className="note-decoration" />
          </div>
          <button className="help-button" onClick={onHelp}>
            <LifeBuoy size={18} />
            How it works
            <ArrowUpRight size={16} />
          </button>
          <div className="sidebar-profile">
            <span className="avatar">{user.initials}</span>
            <div>
              <strong>{user.name}</strong>
              <span>{admin ? 'Professor account' : 'Student account'}</span>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
    </>
  );
}
