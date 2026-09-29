import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  Sparkles,
  Users,
} from 'lucide-react';
import { Brand } from '../components/UI';
import { useSession } from '../context/SessionContext';

export default function Auth({ register = false }) {
  const { authenticate, workspace } = useSession();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: params.get('role') === 'professor' ? 'professor' : 'student',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    setError('');
  }, [register]);
  if (workspace) return <Navigate to={`/app/${workspace.user.role}`} replace />;
  const field = (name) => ({
    value: form[name],
    onChange: (event) => setForm({ ...form, [name]: event.target.value }),
  });
  async function enter(path, body, key) {
    setBusy(key);
    setError('');
    try {
      const data = await authenticate(path, body);
      navigate(`/app/${data.user.role}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  }
  return (
    <main className="auth-page">
      <aside className="auth-story">
        <Brand />
        <div className="auth-story-copy">
          <span className="hero-pill">
            <Sparkles size={14} />A LITTLE MORE TOGETHER
          </span>
          <h1>
            Big ideas.
            <br />
            Small steps.
            <br />
            <em>Your people.</em>
          </h1>
          <p>
            A space to make sense of your semester.
            <br />
            And a little room to enjoy it.
          </p>
          <div className="auth-note">
            <div>
              <span>
                <Check size={19} />
              </span>
              <strong>Your next chapter looks good on you.</strong>
            </div>
            <p>
              Courses, groups, and everything in between.
              <br />
              Let’s find your rhythm.
            </p>
          </div>
        </div>
        <span className="auth-story-footer">
          Made for curious minds. And the people who guide them.
        </span>
        <span className="auth-flower" aria-hidden="true">
          ✳
        </span>
      </aside>
      <section className="auth-content">
        <Link to="/" className="auth-back">
          <ArrowLeft size={15} />
          Back to the good stuff
        </Link>
        <div className="auth-form-wrap">
          <span className="eyebrow-v2">
            {register ? 'MAKE YOURSELF AT HOME' : 'YOUR SPACE, JUST AS YOU LEFT IT'}
          </span>
          <h2>
            {register ? 'A fresh start.' : 'Good to see you.'}
            <span>✦</span>
          </h2>
          <p>
            {register
              ? 'A few details, and you’re part of the picture.'
              : 'Pick up where you left off. A little progress awaits.'}
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              enter(register ? 'register' : 'login', form, 'form');
            }}
            className="form-v2"
          >
            <fieldset disabled={!!busy}>
              {register && (
                <>
                  <div
                    className="role-picker grid grid-cols-2 gap-3"
                    role="group"
                    aria-label="Account role"
                  >
                    {[
                      { id: 'student', label: 'I’m a student', icon: BookOpen },
                      { id: 'professor', label: 'I’m a professor', icon: GraduationCap },
                    ].map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={form.role === id}
                        className={form.role === id ? 'active' : ''}
                        onClick={() => setForm({ ...form, role: id })}
                      >
                        <Icon size={19} />
                        {label}
                        {form.role === id && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                  <label>
                    Full name
                    <input
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={80}
                      placeholder="e.g. Maya Sharma"
                      {...field('name')}
                    />
                  </label>
                </>
              )}
              <label>
                Email address
                <input
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  placeholder="you@yourcollege.edu"
                  {...field('email')}
                />
              </label>
              <label>
                Password
                <div className="password-field">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={register ? 'new-password' : 'current-password'}
                    required
                    minLength={register ? 8 : 1}
                    maxLength={128}
                    placeholder={register ? 'At least 8 characters' : 'Your password'}
                    {...field('password')}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
              {register && (
                <p className="field-note">
                  Choose a password of at least 8 characters. Make it yours.
                </p>
              )}
              {error && (
                <p role="alert" className="error-v2">
                  {error}
                </p>
              )}
              <button className="btn-v2 primary auth-submit" type="submit">
                {busy === 'form'
                  ? 'Getting things ready…'
                  : register
                    ? 'Create my account'
                    : 'Step into my workspace'}
                <ArrowRight size={17} />
              </button>
            </fieldset>
          </form>
          <p className="auth-switch">
            {register ? 'Already found your rhythm?' : 'New around here?'}{' '}
            <Link to={register ? '/login' : '/register'}>
              {register ? 'Log in' : 'Create an account'}
              <ArrowUpRightSmall />
            </Link>
          </p>
          <div className="auth-divider">
            <span />
            OR TAKE A LOOK AROUND
            <span />
          </div>
          <div className="demo-choices">
            <button disabled={!!busy} onClick={() => enter('demo', { profile: 'maya' }, 'student')}>
              <BookOpen size={18} />
              <span>{busy === 'student' ? 'Opening…' : 'Student demo'}</span>
              <ArrowRight size={15} />
            </button>
            <button
              disabled={!!busy}
              onClick={() => enter('demo', { profile: 'ananya' }, 'professor')}
            >
              <GraduationCap size={19} />
              <span>{busy === 'professor' ? 'Opening…' : 'Professor demo'}</span>
              <ArrowRight size={15} />
            </button>
          </div>
          <p className="demo-note">
            <Users size={12} />
            Shared demo accounts. Explore freely; sample data is shared.
          </p>
        </div>
        <div className="auth-bottom">One place. A little more possibility.</div>
      </section>
    </main>
  );
}
function ArrowUpRightSmall() {
  return <ArrowRight size={12} style={{ transform: 'rotate(-40deg)' }} />;
}
