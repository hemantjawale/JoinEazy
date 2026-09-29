import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { Avatar, Brand } from './UI';

export default function WorkspaceLayout() {
  const { workspace, logout, authenticate, notify } = useSession();
  const { user } = workspace;
  const [mobile, setMobile] = useState(false);
  const [account, setAccount] = useState(false);
  const [busy, setBusy] = useState(false);
  const accountRef = useRef(null);
  const accountButton = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const professor = user.role === 'professor';
  useEffect(() => {
    setMobile(false);
    setAccount(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    if (!account) return;
    const close = (event) => {
      if (!accountRef.current?.contains(event.target)) setAccount(false);
    };
    const escape = (event) => {
      if (event.key === 'Escape') {
        setAccount(false);
        accountButton.current?.focus();
      }
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('focusin', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('focusin', close);
      document.removeEventListener('keydown', escape);
    };
  }, [account]);
  useEffect(() => {
    if (!mobile) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const escape = (event) => {
      if (event.key === 'Escape') setMobile(false);
    };
    document.addEventListener('keydown', escape);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener('keydown', escape);
    };
  }, [mobile]);
  async function exit() {
    setBusy(true);
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      notify(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function changeDemo(profile) {
    setBusy(true);
    try {
      const data = await authenticate('demo', { profile });
      navigate(`/app/${data.user.role}`);
      setAccount(false);
      notify('A different perspective. Welcome in.');
    } catch (err) {
      notify(err.message);
    } finally {
      setBusy(false);
    }
  }
  const nav = [
    { to: `/app/${user.role}`, label: 'Overview', icon: LayoutDashboard },
    { to: '/app/courses', label: 'My courses', icon: BookOpen },
    { to: '/app/assignments', label: 'Assignments', icon: GraduationCap },
    { to: '/app/groups', label: professor ? 'Course groups' : 'My groups', icon: Users },
    {
      to: '/app/progress',
      label: professor ? 'Class progress' : 'My progress',
      icon: ChartNoAxesCombined,
    },
  ];
  const breadcrumb = location.pathname.includes('/courses/')
    ? 'Course workspace'
    : nav.find((item) => item.to === location.pathname)?.label || 'Overview';
  return (
    <div className="workspace-v2">
      <a className="skip-v2" href="#workspace-main">
        Skip to content
      </a>
      {mobile && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`sidebar-v2 ${mobile ? 'open' : ''}`}>
        <Brand />
        <button
          className="sidebar-close icon-btn-v2"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        >
          <X size={20} />
        </button>
        <div className="workspace-switch-v2">
          <span className="campus-icon">
            <GraduationCap size={18} />
          </span>
          <div>
            <strong>The learning space</strong>
            <span>Autumn semester · 2026</span>
          </div>
        </div>
        <span className="nav-label-v2">YOUR WORKSPACE</span>
        <nav aria-label="Workspace navigation">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link-v2 ${isActive ? 'active' : ''}`}
            >
              <Icon size={19} strokeWidth={1.7} />
              <span>{label}</span>
              {to === '/app/assignments' && <small>{workspace.assignments.length}</small>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-v2-bottom">
          <div className="sidebar-encouragement">
            <Sparkles size={21} />
            <h3>
              Good work starts
              <br />
              with a little space.
            </h3>
            <p>You’re in the right place.</p>
            <span aria-hidden="true">✳</span>
          </div>
          <Link to="/" className="back-home-link">
            A little about Joineazy
            <ArrowRight size={14} />
          </Link>
          <div className="sidebar-v2-person">
            <Avatar person={user} />
            <div>
              <strong>{user.name}</strong>
              <span>{professor ? 'Professor' : 'Student'} workspace</span>
            </div>
            <span className="live-dot" />
          </div>
        </div>
      </aside>
      <div className="workspace-v2-main">
        <header className="workspace-topbar">
          <div className="workspace-breadcrumb">
            <button
              className="workspace-mobile-menu icon-btn-v2"
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <Menu size={22} />
            </button>
            <span>My workspace</span>
            <i>/</i>
            <strong>{breadcrumb}</strong>
          </div>
          <div className="workspace-account" ref={accountRef}>
            <span className="semester-tag">
              <span />
              AUTUMN ’26
            </span>
            <button
              className="account-trigger-v2"
              ref={accountButton}
              aria-label="Account menu"
              aria-expanded={account}
              onClick={() => setAccount(!account)}
            >
              <Avatar person={user} />
              <span>
                <strong>{user.name}</strong>
                <small>{professor ? 'Professor' : 'Student'}</small>
              </span>
              <ChevronDown size={15} />
            </button>
            {account && (
              <div className="account-popover-v2">
                <div className="account-details">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                  <small>
                    <Check size={12} /> Signed in securely
                  </small>
                </div>
                {user.email.endsWith('@demo.joineazy.app') && (
                  <>
                    <span className="nav-label-v2">EXPLORE ANOTHER DEMO</span>
                    {[
                      { id: 'maya', name: 'Maya Sharma', detail: 'Student · Group leader' },
                      { id: 'arjun', name: 'Arjun Mehta', detail: 'Student · Group member' },
                      { id: 'rohan', name: 'Rohan Patil', detail: 'Student · Individual view' },
                      {
                        id: 'ananya',
                        name: 'Ananya Deshmukh',
                        detail: 'Professor · Web & databases',
                      },
                      { id: 'vikram', name: 'Vikram Rao', detail: 'Professor · Design' },
                    ].map((person) => (
                      <button
                        disabled={busy}
                        className={user.id === person.id ? 'selected' : ''}
                        key={person.id}
                        onClick={() => changeDemo(person.id)}
                      >
                        <span>
                          <strong>{person.name}</strong>
                          <small>{person.detail}</small>
                        </span>
                        {user.id === person.id && <Check size={15} />}
                      </button>
                    ))}
                  </>
                )}
                <button className="logout-v2" onClick={exit} disabled={busy}>
                  <LogOut size={16} />
                  {busy ? 'One moment…' : 'Log out'}
                </button>
              </div>
            )}
          </div>
        </header>
        <main id="workspace-main" className="workspace-content">
          <Outlet />
          <footer className="workspace-footer">
            <span>A little clarity. A lot of possibility.</span>
            <span>Made for learning, together. ✦</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
