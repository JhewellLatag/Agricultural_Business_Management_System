// WBS 4.3.1 — Role-Based Authentication
// Assigned Member(s): Jhewell Latag
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// AuthContext.jsx - nag-iimbak ng naka-login na user
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  // binabasa sa localStorage para hindi mawala pag nag-refresh
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } });
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setUser(null); return; }
    fetch('/api/auth/session', {headers:{Authorization:'Bearer '+token}}).then(async r => { if (!r.ok) throw new Error('Session expired'); return r.json(); }).then(data => { localStorage.setItem('user',JSON.stringify(data.user)); setUser(data.user); }).catch(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); });
  }, []);

  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}