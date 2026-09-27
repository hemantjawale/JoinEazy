import { useEffect, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  CircleCheck,
  Clock3,
  GraduationCap,
  Menu,
  Plus,
  TriangleAlert,
} from 'lucide-react';
import { useWorkspace } from './context/WorkspaceContext';
import Sidebar from './components/Sidebar';
import ProfileMenu from './components/ProfileMenu';
import Hero from './components/Hero';
import Modal from './components/Modal';
import AssignmentList from './features/assignments/AssignmentList';
import AssignmentDetails from './features/assignments/AssignmentDetails';
import AssignmentForm from './features/assignments/AssignmentForm';
import ProgressView from './features/progress/ProgressView';
import { daysUntil, statusOf } from './utils/assignments';

export default function App() {
  const { profiles, workspace, loading, error, toast, switchProfile, retry } = useWorkspace();
  const [view, setView] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState(null);
  const [help, setHelp] = useState(false);
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [mobileOpen]);
  if (!workspace || loading || error)
    return (
      <div className="loading-screen">
        <span className="brand-mark">
          <GraduationCap size={28} />
        </span>
        <h1>joineazy.</h1>
        {error ? (
          <>
            <p role="alert">{error}</p>
            <button className="primary-button" onClick={retry}>
              Try again
            </button>
            <button className="text-button" onClick={() => switchProfile('student-maya')}>
              Reset demo profile
            </button>
          </>
        ) : (
          <>
            <div className="loading-dots" />
            <p>Getting your workspace ready…</p>
          </>
        )}
      </div>
    );
  const { user, assignments, submissions } = workspace;
  const admin = user.role === 'admin';
  const completed = admin
    ? submissions.length
    : assignments.filter((item) => statusOf(item, submissions, user.id) === 'submitted').length;
  const total = admin
    ? assignments.reduce((sum, item) => sum + item.studentIds.length, 0)
    : assignments.length;
  const pending = admin
    ? total - completed
    : assignments.filter((item) => statusOf(item, submissions, user.id) === 'pending').length;
  const overdue = assignments.filter((item) =>
    admin
      ? daysUntil(item.dueDate) < 0 &&
        submissions.filter((submission) => submission.assignmentId === item.id).length <
          item.studentIds.length
      : statusOf(item, submissions, user.id) === 'overdue',
  ).length;
  const stats = [
    {
      title: 'Total assignments',
      value: assignments.length,
      icon: BookOpen,
      tone: 'violet',
      detail: 'Your learning, organized',
    },
    {
      title: admin ? 'Submissions received' : 'Submitted',
      value: completed,
      icon: CircleCheck,
      tone: 'green',
      detail: admin ? 'Great work coming in' : 'One step closer to your goals',
    },
    {
      title: admin ? 'Awaiting submission' : 'To do',
      value: pending,
      icon: Clock3,
      tone: 'orange',
      detail: 'Ready when you are',
    },
    {
      title: 'Overdue assignments',
      value: overdue,
      icon: TriangleAlert,
      tone: 'rose',
      detail: 'A little attention needed',
    },
  ];
  const changeView = (next) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Sidebar
        user={user}
        view={view}
        setView={changeView}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onHelp={() => setHelp(true)}
      />
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button lg:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} />
            </button>
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <strong>
              {view === 'overview'
                ? 'Overview'
                : view === 'assignments'
                  ? 'Assignments'
                  : admin
                    ? 'Student progress'
                    : 'My progress'}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="demo-badge">
              <span />
              Demo workspace
            </span>
            <ProfileMenu
              user={user}
              profiles={profiles}
              onSelect={(id) => {
                setSelected(null);
                setEditor(null);
                changeView('overview');
                switchProfile(id);
              }}
            />
          </div>
        </header>
        <main id="main-content" className="main-content">
          <div className="page-heading">
            <div>
              <div className="page-kicker">
                {admin ? 'TEACHING, THOUGHTFULLY' : 'YOUR SPACE TO GROW'}
              </div>
              <h1>
                {view === 'overview' ? (
                  <>
                    Hello, {user.name.split(' ')[0]} <span className="greeting-wave">☀</span>
                  </>
                ) : view === 'assignments' ? (
                  'A place for your best work.'
                ) : admin ? (
                  'Progress worth celebrating.'
                ) : (
                  'Look how far you’ve come.'
                )}
              </h1>
              <p>
                {view === 'overview'
                  ? admin
                    ? 'Here’s what’s happening in your classroom today.'
                    : 'Let’s make a little progress today. You’ve got this.'
                  : view === 'assignments'
                    ? 'Less searching. More doing. Your next step is right here.'
                    : 'Small efforts add up to something meaningful.'}
              </p>
            </div>
            {admin ? (
              <button className="primary-button create-button" onClick={() => setEditor({})}>
                <Plus size={17} />
                Create assignment
              </button>
            ) : (
              <div className="today-label">
                <CalendarDays size={15} />
                <span>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
          {view === 'overview' && (
            <>
              <Hero
                admin={admin}
                completed={completed}
                total={total}
                onProgress={() => changeView('progress')}
              />
              <div className="stats-grid">
                {stats.map(({ title, value, icon: Icon, tone, detail }) => (
                  <section className="stat-card" key={title}>
                    <div>
                      <span className="stat-title">{title}</span>
                      <strong>{String(value).padStart(2, '0')}</strong>
                      <p>{detail}</p>
                    </div>
                    <span className={`stat-icon ${tone}`}>
                      <Icon size={19} strokeWidth={1.7} />
                    </span>
                  </section>
                ))}
              </div>
            </>
          )}
          {view === 'progress' ? (
            <ProgressView onOpen={setSelected} />
          ) : (
            <AssignmentList
              key={user.id}
              onOpen={setSelected}
              full={view === 'assignments'}
              onCreate={() => setEditor({})}
            />
          )}
          <footer className="page-footer">
            <span>Made for learning. Designed for you.</span>
            <span>
              joineazy<span className="text-violet-500">.</span>
            </span>
          </footer>
        </main>
      </div>
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
        <AssignmentForm assignment={editor.id ? editor : null} onClose={() => setEditor(null)} />
      )}
      {help && (
        <Modal title="A little guide to your workspace" onClose={() => setHelp(false)}>
          <div className="help-content">
            <div>
              <span className="course-icon violet">
                <BookOpen size={22} />
              </span>
              <h3>One place for every assignment</h3>
              <p>
                Find your brief, due date, and external submission link. Search by title or course
                and filter by status.
              </p>
            </div>
            <div>
              <span className="course-icon green">
                <ArrowDownToLine size={22} />
              </span>
              <h3>Submit, then confirm</h3>
              <p>
                Upload your work to the professor’s folder. Choose “Yes, I have submitted”, verify
                access, and confirm. Your progress updates instantly.
              </p>
            </div>
            <div>
              <span className="course-icon orange">
                <ArrowUpRight size={22} />
              </span>
              <h3>Explore both sides</h3>
              <p>
                Use the profile selector to try a professor account. Create assignments, choose
                students, and see each student’s progress. Each professor manages only their own
                assignments.
              </p>
            </div>
            <p className="info-panel">
              This is a demo with selectable identities, not a production login. Sample submission
              folders are empty until a professor adds a real link. Data is saved on this server.
            </p>
          </div>
          <div className="modal-footer justify-end">
            <button className="primary-button" onClick={() => setHelp(false)}>
              Got it
              <Check size={16} />
            </button>
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <CircleCheck size={19} />
          {toast}
        </div>
      )}
    </div>
  );
}
