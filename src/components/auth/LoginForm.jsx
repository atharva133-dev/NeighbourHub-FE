import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm({ onSwitchToRegister }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      setSuccess(true);
      toast.success('Welcome back');
      setTimeout(() => navigate('/community'), 900);
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      toast.error(message);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="auth-success-check flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
          <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" strokeWidth={2} />
        </div>
        <p className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Welcome back!</p>
        <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Redirecting to your communities...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
        <p className="mt-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">Sign in to your NeighbourHub account</p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={`space-y-5 ${shake ? 'auth-shake' : ''}`}>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input glass-input w-full"
            placeholder="Enter here "
          />
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
              required
              className="auth-input glass-input w-full pr-10"
              placeholder="••••••••"
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
        </div>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 bg-white text-purple-600 focus:ring-purple-500/40 dark:border-white/20 dark:bg-slate-900/50"
            />
            Remember me
          </label>
          <button
            type="button"
            className="text-sm font-bold text-purple-600 transition hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-purple-500/40 disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-bold text-purple-600 transition hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
        >
          Register
        </button>
      </p>
    </>
  );
}
