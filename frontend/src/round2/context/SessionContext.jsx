import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const SessionContext = createContext(null);
export function SessionProvider({ children }) {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  async function refresh() {
    try {
      const data = await api('/workspace');
      setWorkspace(data);
      setError('');
      return data;
    } catch (err) {
      if (err.status === 401) setWorkspace(null);
      else setError(err.message);
      throw err;
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    api('/workspace', { signal: controller.signal })
      .then(setWorkspace)
      .catch((err) => {
        if (err.status !== 401 && err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(''), 4500);
    return () => clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    if (!workspace?.user.id) return;
    const controller = new AbortController();
    const sync = () => {
      if (document.visibilityState !== 'visible') return;
      api('/workspace', { signal: controller.signal })
        .then((data) => {
          setWorkspace(data);
          setError('');
        })
        .catch((err) => {
          if (err.status === 401) setWorkspace(null);
        });
    };
    window.addEventListener('focus', sync);
    const timer = setInterval(sync, 30000);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener('focus', sync);
    };
  }, [workspace?.user.id]);
  async function authenticate(path, body) {
    await api(`/auth/${path}`, { method: 'POST', body });
    return refresh();
  }
  async function logout() {
    await api('/auth/logout', { method: 'POST' });
    setWorkspace(null);
    setToast('');
  }
  async function mutate(path, method, body, message) {
    try {
      const result = await api(path, { method, body });
      await refresh();
      setToast(message);
      return result;
    } catch (err) {
      if (err.status === 401) setWorkspace(null);
      throw err;
    }
  }
  return (
    <SessionContext.Provider
      value={{
        workspace,
        loading,
        error,
        authenticate,
        logout,
        refresh,
        mutate,
        toast,
        notify: setToast,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export const useSession = () => useContext(SessionContext);
