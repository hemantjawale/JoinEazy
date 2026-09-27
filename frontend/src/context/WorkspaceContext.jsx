import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { request } from '../services/api';

const WorkspaceContext = createContext(null);
const savedProfile = () => {
  try {
    return localStorage.getItem('joineazy-profile') || 'student-maya';
  } catch {
    return 'student-maya';
  }
};

export function WorkspaceProvider({ children }) {
  const [userId, setUserId] = useState(savedProfile);
  const [profiles, setProfiles] = useState([]);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    Promise.all([
      request('/demo-users', { signal: controller.signal }),
      request('/workspace', { userId, signal: controller.signal }),
    ])
      .then(([people, data]) => {
        setProfiles(people);
        setWorkspace(data);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [userId, revision]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const switchProfile = (id) => {
    setToast('');
    setWorkspace(null);
    setUserId(id);
    try {
      localStorage.setItem('joineazy-profile', id);
    } catch {
      /* Profile still works without browser storage. */
    }
  };
  const mutate = useCallback(
    async (path, method, body, message) => {
      await request(path, { userId, method, body });
      const data = await request('/workspace', { userId });
      setWorkspace(data);
      setToast(message);
    },
    [userId],
  );

  return (
    <WorkspaceContext.Provider
      value={{
        profiles,
        userId,
        workspace,
        loading,
        error,
        toast,
        switchProfile,
        mutate,
        retry: () => setRevision((value) => value + 1),
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

// Kept with its provider so feature components have a single state entry point.
// eslint-disable-next-line react-refresh/only-export-components
export const useWorkspace = () => useContext(WorkspaceContext);
