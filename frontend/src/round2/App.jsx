import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { CircleCheck, X } from 'lucide-react';
import { SessionProvider, useSession } from './context/SessionContext';
import { Loading } from './components/UI';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import WorkspaceLayout from './components/WorkspaceLayout';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Assignments from './pages/Assignments';
import Groups from './pages/Groups';
import ProgressPage from './pages/ProgressPage';

function Guard() {
  const { workspace, loading, error, refresh } = useSession();
  if (loading) return <Loading />;
  if (error && !workspace)
    return (
      <div className="loading-v2">
        <h1>Let’s reconnect.</h1>
        <p role="alert">{error}</p>
        <button className="btn-v2 primary" onClick={() => refresh().catch(() => {})}>
          Try again
        </button>
      </div>
    );
  return workspace ? <Outlet /> : <Navigate to="/login" replace />;
}
function Toast() {
  const { toast, notify } = useSession();
  return (
    toast && (
      <div className="toast-v2" role="status">
        <CircleCheck size={19} />
        <span>{toast}</span>
        <button onClick={() => notify('')} aria-label="Dismiss notification">
          <X size={15} />
        </button>
      </div>
    )
  );
}
function RoleRedirect() {
  const { workspace } = useSession();
  return <Navigate to={`/app/${workspace.user.role}`} replace />;
}
function RoleDashboard() {
  const { workspace } = useSession();
  const { pathname } = useLocation();
  return pathname !== `/app/${workspace.user.role}` ? (
    <Navigate to={`/app/${workspace.user.role}`} replace />
  ) : (
    <Dashboard />
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth register />} />
          <Route element={<Guard />}>
            <Route path="/app" element={<WorkspaceLayout />}>
              <Route index element={<RoleRedirect />} />
              <Route path="student" element={<RoleDashboard />} />
              <Route path="professor" element={<RoleDashboard />} />
              <Route path="courses" element={<Courses />} />
              <Route path="courses/:courseId" element={<Assignments />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="groups" element={<Groups />} />
              <Route path="progress" element={<ProgressPage />} />
            </Route>
          </Route>
          <Route
            path="*"
            element={
              <div className="loading-v2">
                <h1>A little off course?</h1>
                <p>This page doesn’t exist.</p>
                <a className="btn-v2 primary" href="/">
                  Back to Joineazy
                </a>
              </div>
            }
          />
        </Routes>
        <Toast />
      </SessionProvider>
    </BrowserRouter>
  );
}
