// WBS 4.3.1–4.3.5 — Login and Role Routing
// Assigned Member(s): Jhewell Latag
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// Login.jsx - login page: may drawing ng Gulayan, Prutasan, Babuyan at show/hide password
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { DEPARTMENTS, Hills } from './LoginArt.jsx';
import '../styles/login.css';

// Icon ng mata (nakikita ang password)
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Icon ng mata na may guhit (nakatago ang password)
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.9 10.9 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A10.9 10.9 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <path d="M1 1l22 22" />
  </svg>
);

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post('/auth/login', form);
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* KALIWA: drawing at description ng tatlong department */}
      <section className="login-hero">
        <div className="hero-brand">
          <span className="brand-mark">A</span>
          <strong>Agri Business</strong>
        </div>

        <div className="hero-text">
          <h1>One system for the whole farm.</h1>
          <p>Sales, inventory, expenses, and livestock for Gulayan, Prutasan, and Babuyan.</p>
        </div>

        <div className="dept-cards">
          {DEPARTMENTS.map(({ key, name, text, Art }, i) => (
            <div className={`dept-card dept-${key}`} key={key} style={{ animationDelay: `${0.15 * i}s` }}>
              <div className="dept-art" style={{ animationDelay: `${i * 0.6}s` }}><Art /></div>
              <h3>{name}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>

        <Hills />
      </section>

      {/* KANAN: login form */}
      <section className="login-side">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Welcome back</h2>
          <p className="login-sub">Log in to continue.</p>

          <label>Username
            <input name="username" value={form.username} onChange={handleChange} autoComplete="username" autoFocus />
          </label>

          <label>Password
            {/* Show / hide password */}
            <div className="pw-field">
              <input name="password" type={showPassword ? 'text' : 'password'} value={form.password}
                onChange={handleChange} autoComplete="current-password" />
              <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </label>

          {error && <div className="form-error">{error}</div>}
          <button className="btn-primary" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
        </form>
      </section>
    </div>
  );
}
