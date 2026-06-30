import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, MailCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const RESEND_COOLDOWN = 30; // seconds

export default function OtpVerificationForm({ email, onBack }) {
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef([]);

  // Start the resend cooldown timer on mount
  useEffect(() => {
    let remaining = RESEND_COOLDOWN;
    const interval = setInterval(() => {
      remaining -= 1;
      setCooldown(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError('');
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const otp = digits.join('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      setSuccess(true);
      toast.success('Email verified! Welcome to NeighbourHub.');
      setTimeout(() => navigate('/community'), 1000);
    } catch (err) {
      const message = err.response?.data?.message || 'Verification failed';
      setError(message);
      toast.error(message);
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 0);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      await resendOtp(email);
      toast.success('New OTP sent to your email.');
      setDigits(['', '', '', '', '', '']);
      // restart cooldown
      let remaining = RESEND_COOLDOWN;
      setCooldown(remaining);
      const interval = setInterval(() => {
        remaining -= 1;
        setCooldown(remaining);
        if (remaining <= 0) clearInterval(interval);
      }, 1000);
      setTimeout(() => inputRefs.current[0]?.focus(), 0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="auth-success-check flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
          <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" strokeWidth={2} />
        </div>
        <p className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Verified!</p>
        <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
          Redirecting to your communities...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/30">
          <MailCheck className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Check your email</h2>
        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          We sent a 6-digit code to
        </p>
        <p className="mt-0.5 text-sm font-bold text-purple-600 dark:text-purple-400 break-all">
          {email}
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 6-digit boxes */}
        <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              aria-label={`OTP digit ${i + 1}`}
              className={[
                'h-12 w-10 rounded-xl border text-center text-lg font-bold transition-all duration-150',
                'bg-white dark:bg-white/5 text-slate-900 dark:text-white outline-none',
                digit
                  ? 'border-purple-500 ring-2 ring-purple-500/30 dark:border-purple-400 dark:ring-purple-400/30'
                  : 'border-slate-300 dark:border-white/20',
                'focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30',
                'dark:focus:border-purple-400 dark:focus:ring-purple-400/30',
              ].join(' ')}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-purple-500/40 disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify email'
          )}
        </button>
      </form>

      {/* Resend + Back */}
      <div className="mt-6 space-y-3 text-center">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Didn&apos;t receive the code?{' '}
          {cooldown > 0 ? (
            <span className="font-bold text-slate-400 dark:text-slate-500">
              Resend in {cooldown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-bold text-purple-600 transition hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 disabled:opacity-60"
            >
              {resending ? 'Sending...' : 'Resend code'}
            </button>
          )}
        </p>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Wrong email?{' '}
          <button
            type="button"
            onClick={onBack}
            className="font-bold text-purple-600 transition hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
          >
            Go back
          </button>
        </p>
      </div>
    </>
  );
}
