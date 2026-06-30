import { useMemo, useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' };
  if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-yellow-500' };
  return { score: 3, label: 'Strong', color: 'bg-green-500' };
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterForm({ onSwitchToLogin, onRegistered }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [touched, setTouched] = useState({});

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const fieldErrors = useMemo(() => {
    const errors = {};
    if (touched.name && name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (touched.email && email && !validateEmail(email)) {
      errors.email = 'Enter a valid email address';
    }
    if (touched.password && password && password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (touched.confirmPassword && confirmPassword && confirmPassword !== password) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  }, [name, email, password, confirmPassword, touched]);

  const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (name.trim().length < 2) return;
    if (!validateEmail(email)) return;
    if (password.length < 6) return;
    if (password !== confirmPassword) return;
    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const { email: registeredEmail } = await register(name, email, password);
      toast.success('Account created — check your email for the OTP.');
      if (onRegistered) onRegistered(registeredEmail);
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Join NeighbourHub</h2>
        <p className="mt-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">Connect with your local community</p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200">
            Full name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => markTouched('name')}
            required
            className="auth-input glass-input w-full"
            placeholder="Jane Doe"
          />
          {fieldErrors.name && (
            <p className="mt-1.5 text-xs font-semibold text-red-500 dark:text-red-400">{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => markTouched('email')}
            required
            className="auth-input glass-input w-full"
            placeholder="you@example.com"
          />
          {fieldErrors.email && (
            <p className="mt-1.5 text-xs font-semibold text-red-500 dark:text-red-400">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => markTouched('password')}
              required
              minLength={6}
              className="auth-input glass-input w-full pr-10"
              placeholder="At least 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-white"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-2.5">
              <div className="flex h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: `${(strength.score / 3) * 100}%` }}
                />
              </div>
              {strength.label && (
                <p
                  className={`mt-1.5 text-xs font-bold ${
                    strength.label === 'Weak'
                      ? 'text-red-500 dark:text-red-400'
                      : strength.label === 'Fair'
                        ? 'text-yellow-500 dark:text-yellow-400'
                        : 'text-green-500 dark:text-green-400'
                  }`}
                >
                  {strength.label}
                </p>
              )}
            </div>
          )}
          {fieldErrors.password && (
            <p className="mt-1.5 text-xs font-semibold text-red-500 dark:text-red-400">{fieldErrors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => markTouched('confirmPassword')}
              required
              className="auth-input glass-input w-full pr-10"
              placeholder="Re-enter your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-white"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="mt-1.5 text-xs font-semibold text-red-500 dark:text-red-400">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-sm font-medium text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 bg-white text-purple-600 focus:ring-purple-500/40 dark:border-white/20 dark:bg-slate-900/50"
          />
          <span>
            I agree to the{' '}
            <button type="button" className="font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors">
              Terms and Conditions
            </button>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-purple-500/40 disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-bold text-purple-600 transition hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
        >
          Sign in
        </button>
      </p>
    </>
  );
}
