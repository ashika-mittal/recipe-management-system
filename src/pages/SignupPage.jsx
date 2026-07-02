import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUpUser } from '../firebase/auth';
import { validateSignupForm } from '../utils/validators';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    displayName: '', email: '', password: '', confirmPassword: '',
  });
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
    const v = validateSignupForm(form);
    if (Object.keys(v).length) { setErrors(v); return; }

    setLoading(true);
    try {
      await signUpUser(form.email, form.password, form.displayName);
      navigate('/');
    } catch (err) {
      const map = {
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/invalid-email': 'Invalid email address.',
      };
      setFbError(map[err.code] || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* ─── Left: decorative panel ─── */}
      <div className="hidden lg:flex flex-col justify-center flex-1 gradient-hero p-16 text-white">
        <span className="text-5xl mb-6 animate-float inline-block w-fit">🍳</span>
        <h2 className="text-4xl font-extrabold font-heading leading-tight mb-4">
          Share Your<br />Culinary Magic
        </h2>
        <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
          Create an account to submit recipes, bookmark favourites,
          rate dishes, and join a community of passionate home cooks.
        </p>
      </div>

      {/* ─── Right: form ─── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold font-heading text-text mb-1">
              Create your account
            </h1>
            <p className="text-text-secondary text-sm">
              Join the Zayka community
            </p>
          </div>

          {fbError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-danger-light text-danger text-sm mb-5">
              <FiAlertCircle className="mt-0.5 shrink-0" />
              {fbError}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <Field
              label="Full Name"
              icon={<FiUser />}
              name="displayName"
              value={form.displayName}
              onChange={onChange}
              placeholder="Your name"
              error={errors.displayName}
            />

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
                  placeholder="Min. 6 characters"
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

            <Field
              label="Confirm Password"
              icon={<FiLock />}
              type={showPw ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={onChange}
              placeholder="Re-enter password"
              error={errors.confirmPassword}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-text-muted text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */

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
