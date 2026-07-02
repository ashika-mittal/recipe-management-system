import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInUser } from '../firebase/auth';
import { validateLoginForm } from '../utils/validators';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [fbError, setFbError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setFbError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validateLoginForm(form);
    if (Object.keys(v).length) { setErrors(v); return; }

    setLoading(true);
    try {
      await signInUser(form.email, form.password);
      navigate('/');
    } catch (err) {
      const map = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many attempts — try again later.',
      };
      setFbError(map[err.code] || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* ─── Left: decorative panel ─── */}
      <div className="hidden lg:flex flex-col justify-center flex-1 gradient-hero p-16 text-white">
        <span className="text-5xl mb-6 animate-float inline-block w-fit">🍛</span>
        <h2 className="text-4xl font-extrabold font-heading leading-tight mb-4">
          Where Every Recipe<br />Tells a Story
        </h2>
        <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
          Join thousands of food lovers sharing authentic Indian recipes —
          from street-side chaat to royal mughlai feasts.
        </p>
      </div>

      {/* ─── Right: form ─── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold font-heading text-text mb-1">
              Welcome back
            </h1>
            <p className="text-text-secondary text-sm">
              Sign in to your Zayka account
            </p>
          </div>

          {/* Firebase error */}
          {fbError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-danger-light text-danger text-sm mb-5">
              <FiAlertCircle className="mt-0.5 shrink-0" />
              {fbError}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <Field
              label="Email"
              icon={<FiMail />}
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="you@example.com"
              error={errors.email}
            />

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="••••••••"
                  className={inputCls(errors.password) + ' pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <Hint>{errors.password}</Hint>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-text-muted text-center mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Reusable helpers ── */

function Field({ label, icon, error, ...rest }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">{icon}</span>
        <input className={inputCls(error)} {...rest} />
      </div>
      {error && <Hint>{error}</Hint>}
    </div>
  );
}

function Hint({ children }) {
  return <p className="mt-1 text-xs text-danger">{children}</p>;
}

function inputCls(hasError) {
  return `w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-colors focus-ring ${
    hasError
      ? 'border-danger focus:border-danger'
      : 'border-border focus:border-primary'
  }`;
}
