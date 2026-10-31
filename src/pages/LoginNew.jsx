import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../utils/apiError';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Login.css';

const feedItems = [
  { icon: '🔧', text: 'Elevator restored', detail: 'Block C, both lifts running', meta: '2 MIN AGO · FACILITIES', color: 'ic-a' },
  { icon: '📦', text: '3 parcels', detail: 'waiting at the front desk', meta: '14 MIN AGO · DELIVERIES', color: 'ic-b' },
  { icon: '🎉', text: 'Rooftop potluck', detail: 'this Saturday, 7 PM', meta: '1 HR AGO · EVENTS', color: 'ic-c' },
  { icon: '🚗', text: 'Parking stickers', detail: 'renew by Friday', meta: '3 HR AGO · NOTICES', color: 'ic-a' },
  { icon: '💧', text: 'Water tank cleaning', detail: 'supply paused 10–1 PM', meta: '5 HR AGO · MAINTENANCE', color: 'ic-b' },
  { icon: '🏸', text: 'Court booking', detail: 'confirmed for Sunday 6 AM', meta: '6 HR AGO · AMENITIES', color: 'ic-c' },
];

export default function LoginNew({ initialMode = 'login' }) {
  const { login, register, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(initialMode === 'signup');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [showOtpCard, setShowOtpCard] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpSuccess, setOtpSuccess] = useState(false);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);  // triggers card flip
  const [forgotStep, setForgotStep] = useState('email'); // 'email' | 'otp' | 'newpass' | 'done'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '', '', '']);
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotResendTimer, setForgotResendTimer] = useState(0);
  const forgotOtpRefs = useRef([]);

  const feedTrackRef = useRef(null);
  const otpInputRefs = useRef([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back');
      navigate('/community');
    } catch (err) {
      const message = getApiErrorMessage(err, 'Login failed');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (signupPassword !== signupConfirm) {
      toast.error('Passwords do not match');
      return;
    }

    setSignupLoading(true);
    try {
      await register(signupName, signupEmail, signupPassword);
      toast.success('Account created! Please check your email for verification code.');
      // Show OTP card instead of navigating
      setOtpEmail(signupEmail);
      // Reset signup form
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirm('');
      setShowSignup(false);
      setShowOtpCard(true);
    } catch (err) {
      const message = getApiErrorMessage(err, 'Registration failed');
      toast.error(message);
    } finally {
      setSignupLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otpValues.join('');
    if (otpCode.length !== 6) return;

    setOtpLoading(true);
    try {
      await verifyOtp(otpEmail, otpCode);
      // Show success on modal instead of toast
      setOtpSuccess(true);
      // Redirect after short delay
      setTimeout(() => {
        setShowOtpCard(false);
        setOtpValues(['', '', '', '', '', '']);
        setOtpSuccess(false);
        navigate('/community');
      }, 1500);
    } catch (err) {
      const message = getApiErrorMessage(err, 'OTP verification failed');
      toast.error(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      await resendOtp(otpEmail);
      toast.success('New code sent to your email');
      // Clear old OTP values so user must enter new code
      setOtpValues(['', '', '', '', '', '']);
      // Focus first input
      otpInputRefs.current[0]?.focus();
      // Start 60 second timer
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to resend code');
      toast.error(message);
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const newValues = [...otpValues];
    newValues[index] = value.replace(/[^0-9]/g, '').slice(0, 1);
    setOtpValues(newValues);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    const newValues = [...otpValues];
    paste.split('').forEach((char, i) => {
      if (i < 6) newValues[i] = char;
    });
    setOtpValues(newValues);
    // Focus the next empty input or the last one
    const nextEmpty = newValues.findIndex(v => !v);
    (nextEmpty === -1 ? otpInputRefs.current[5] : otpInputRefs.current[nextEmpty])?.focus();
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  // ── Forgot password handlers ──
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      toast.success('Reset code sent! Check your inbox.');
      setForgotStep('otp');
      setForgotOtp(['', '', '', '', '', '']);
      setTimeout(() => forgotOtpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to send reset code'));
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotOtpChange = (index, value) => {
    const next = [...forgotOtp];
    next[index] = value.replace(/[^0-9]/g, '').slice(0, 1);
    setForgotOtp(next);
    if (value && index < 5) forgotOtpRefs.current[index + 1]?.focus();
  };

  const handleForgotOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !forgotOtp[index] && index > 0)
      forgotOtpRefs.current[index - 1]?.focus();
  };

  const handleForgotOtpPaste = (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    const next = [...forgotOtp];
    paste.split('').forEach((c, i) => { if (i < 6) next[i] = c; });
    setForgotOtp(next);
    const firstEmpty = next.findIndex(v => !v);
    (firstEmpty === -1 ? forgotOtpRefs.current[5] : forgotOtpRefs.current[firstEmpty])?.focus();
  };

  const handleForgotOtpSubmit = (e) => {
    e.preventDefault();
    if (forgotOtp.join('').length !== 6) return;
    setForgotStep('newpass');
  };

  const handleForgotResend = async () => {
    setForgotLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      toast.success('New code sent!');
      setForgotOtp(['', '', '', '', '', '']);
      forgotOtpRefs.current[0]?.focus();
      setForgotResendTimer(60);
      const t = setInterval(() => setForgotResendTimer(p => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; }), 1000);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to resend code'));
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotResetSubmit = async (e) => {
    e.preventDefault();
    if (forgotNewPass !== forgotConfirmPass) { toast.error('Passwords do not match'); return; }
    if (forgotNewPass.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setForgotLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: forgotEmail,
        otp: forgotOtp.join(''),
        newPassword: forgotNewPass,
      });
      setForgotStep('done');
      setTimeout(() => {
        setShowForgot(false);
        setForgotStep('email');
        setForgotEmail('');
        setForgotOtp(['', '', '', '', '', '']);
        setForgotNewPass('');
        setForgotConfirmPass('');
      }, 2000);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to reset password'));
    } finally {
      setForgotLoading(false);
    }
  };

  const cancelForgot = () => {
    setShowForgot(false);
    setForgotStep('email');
    setForgotEmail('');
    setForgotOtp(['', '', '', '', '', '']);
    setForgotNewPass('');
    setForgotConfirmPass('');
  };

  const handleFeedHover = (paused) => {
    if (feedTrackRef.current) {
      feedTrackRef.current.style.animationPlayState = paused ? 'paused' : 'running';
    }
  };

  return (
    <div className="login-page">
      <main className="login-main">
        <section className="story">
          <div className="story-blob"></div>
          <div className="stamp">EST.<br />2000+<br />COMMUNITIES</div>

          <div className="kicker">Right now, nearby</div>
          <h1>The block is <em>talking</em>.<br />Come listen in.</h1>
          <p className="lead">Notices, bookings, and neighbourly chatter — all in one running feed, updated the moment it happens.</p>

          <div
            className="feed-window"
            onMouseEnter={() => handleFeedHover(true)}
            onMouseLeave={() => handleFeedHover(false)}
          >
            <div className="feed-track" ref={feedTrackRef}>
              {[...feedItems, ...feedItems].map((item, idx) => (
                <div key={idx} className="feed-item">
                  <div className={`fi-icon ${item.color}`}>{item.icon}</div>
                  <div>
                    <div className="fi-text"><b>{item.text}</b> — {item.detail}</div>
                    <div className="fi-meta">{item.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="story-foot">
            <div className="foot-stat"><b>2,000+</b><span>Communities live</span></div>
            <div className="foot-stat"><b>99.9%</b><span>Uptime</span></div>
            <div className="foot-stat"><b>&lt;1s</b><span>Notice delivery</span></div>
          </div>
        </section>

        <section className="authwrap">
          <div className={`auth-card ${showSignup || showOtpCard || showForgot ? 'flipped' : ''}`}>
            {/* Front - Login Form */}
            <div className="auth-card-front">
              <div className="auth-icon">👋</div>
              <h2>Good to see you again</h2>
              <p className="auth-sub">Sign in to catch up on what you missed.</p>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="email">Email address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="password">Password</label>
                  <div className="input-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={togglePassword}
                    >
                      {showPassword ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>

                <div className="row-between">
                  <label className="remember">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    Keep me signed in
                  </label>
                  <a className="forgot" href="#" onClick={(e) => { e.preventDefault(); setShowForgot(true); }}>Forgot password?</a>
                </div>

                <button type="submit" className="btn-signin" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <div className="divider">or</div>

              <button
                className="btn-code"
                onClick={() => navigate('/register')}
              >
                🔑 Join with a 6-digit code
              </button>

              <p className="switch-line">
                First time here? <a href="#" onClick={(e) => { e.preventDefault(); setShowSignup(true); }}>Create your account</a>
              </p>
            </div>

            {/* Back - Signup Form OR OTP OR Forgot Password (same face) */}
            <div className="auth-card-back">
              {showForgot ? (
                /* ── Forgot Password Flow ── */
                forgotStep === 'done' ? (
                  <>
                    <div className="otp-card-success-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="#1c1a17" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h2>Password reset!</h2>
                    <p className="auth-sub">You can now sign in with your new password.</p>
                  </>
                ) : forgotStep === 'newpass' ? (
                  <>
                    <div className="auth-icon">🔐</div>
                    <h2>New password</h2>
                    <p className="auth-sub">Choose a strong new password for <strong>{forgotEmail}</strong>.</p>
                    <form onSubmit={handleForgotResetSubmit}>
                      <div className="field">
                        <label htmlFor="fp-newpass">New password</label>
                        <input
                          type="password"
                          id="fp-newpass"
                          value={forgotNewPass}
                          onChange={(e) => setForgotNewPass(e.target.value)}
                          placeholder="At least 6 characters"
                          required
                          minLength={6}
                          autoFocus
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="fp-confirm">Confirm password</label>
                        <input
                          type="password"
                          id="fp-confirm"
                          value={forgotConfirmPass}
                          onChange={(e) => setForgotConfirmPass(e.target.value)}
                          placeholder="Repeat your password"
                          required
                        />
                      </div>
                      <button type="submit" className="btn-signin" disabled={forgotLoading}>
                        {forgotLoading ? 'Resetting…' : 'Set new password'}
                      </button>
                    </form>
                    <button className="otp-close-btn" onClick={() => setForgotStep('otp')}>← Back</button>
                  </>
                ) : forgotStep === 'otp' ? (
                  <>
                    <div className="auth-icon">📬</div>
                    <h2>Check your email</h2>
                    <p className="auth-sub">We sent a 6-digit reset code to <strong>{forgotEmail}</strong>. Enter it below.</p>
                    <form onSubmit={handleForgotOtpSubmit}>
                      <div className="otp-input-row">
                        {forgotOtp.map((val, i) => (
                          <div key={i} className="otp-input-wrapper">
                            <input
                              ref={(el) => (forgotOtpRefs.current[i] = el)}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={val}
                              onChange={(e) => handleForgotOtpChange(i, e.target.value)}
                              onKeyDown={(e) => handleForgotOtpKeyDown(i, e)}
                              onPaste={handleForgotOtpPaste}
                              className={`otp-box ${val ? 'filled' : ''}`}
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        type="submit"
                        className={`otp-verify-btn ${forgotOtp.every(v => v) ? 'active' : ''}`}
                        disabled={!forgotOtp.every(v => v)}
                      >
                        Continue
                      </button>
                    </form>
                    <div className="otp-resend-section">
                      {forgotResendTimer > 0 ? (
                        <span className="otp-resend-timer">Resend in {forgotResendTimer}s</span>
                      ) : (
                        <button className="otp-resend-btn" onClick={handleForgotResend} disabled={forgotLoading}>
                          {forgotLoading ? 'Sending…' : 'Resend code'}
                        </button>
                      )}
                    </div>
                    <button className="otp-close-btn" onClick={cancelForgot}>← Back to sign in</button>
                  </>
                ) : (
                  /* forgotStep === 'email' */
                  <>
                    <div className="auth-icon">🔑</div>
                    <h2>Forgot password?</h2>
                    <p className="auth-sub">No worries. Enter your email and we'll send you a reset code.</p>
                    <form onSubmit={handleForgotEmailSubmit}>
                      <div className="field">
                        <label htmlFor="fp-email">Email address</label>
                        <input
                          type="email"
                          id="fp-email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          autoFocus
                        />
                      </div>
                      <button type="submit" className="btn-signin" disabled={forgotLoading}>
                        {forgotLoading ? 'Sending…' : 'Send reset code'}
                      </button>
                    </form>
                    <button className="otp-close-btn" onClick={cancelForgot}>← Back to sign in</button>
                  </>
                )
              ) : showOtpCard ? (
                /* OTP content replaces signup in the same back face */
                otpSuccess ? (
                  <>
                    <div className="otp-card-success-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="#1c1a17" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h2>Email verified!</h2>
                    <p className="auth-sub">Redirecting to your community…</p>
                  </>
                ) : (
                  <>
                    <div className="auth-icon">📬</div>
                    <h2>Verify your email</h2>
                    <p className="auth-sub">
                      We've sent a 6-digit code to <strong>{otpEmail}</strong>. Enter it below.
                    </p>
                    <form onSubmit={handleOtpSubmit}>
                      <div className="otp-input-row">
                        {otpValues.map((value, index) => (
                          <div key={index} className="otp-input-wrapper">
                            <input
                              ref={(el) => (otpInputRefs.current[index] = el)}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={value}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              onPaste={handleOtpPaste}
                              className={`otp-box ${value ? 'filled' : ''}`}
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        type="submit"
                        className={`otp-verify-btn ${otpValues.every(v => v) ? 'active' : ''}`}
                        disabled={otpLoading || !otpValues.every(v => v)}
                      >
                        {otpLoading ? 'Verifying…' : 'Verify email'}
                      </button>
                    </form>
                    <div className="otp-resend-section">
                      {resendTimer > 0 ? (
                        <span className="otp-resend-timer">Resend code in {resendTimer}s</span>
                      ) : (
                        <button
                          className="otp-resend-btn"
                          onClick={handleResendOtp}
                          disabled={resendLoading}
                        >
                          {resendLoading ? 'Sending…' : 'Resend code'}
                        </button>
                      )}
                    </div>
                    <button
                      className="otp-close-btn"
                      onClick={() => { setShowOtpCard(false); setShowSignup(false); setOtpValues(['', '', '', '', '', '']); }}
                    >
                      ← Back to sign in
                    </button>
                  </>
                )
              ) : (
                /* Normal signup form */
                <>
                  <div className="auth-icon">✨</div>
                  <h2>Create your account</h2>
                  <p className="auth-sub">Join your community in seconds.</p>

                  <form onSubmit={handleSignup}>
                    <div className="field">
                      <label htmlFor="signup-name">Full name</label>
                      <input
                        type="text"
                        id="signup-name"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="signup-email">Email address</label>
                      <input
                        type="email"
                        id="signup-email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="signup-password">Password</label>
                      <input
                        type="password"
                        id="signup-password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Create a password"
                        required
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="signup-confirm">Confirm password</label>
                      <input
                        type="password"
                        id="signup-confirm"
                        value={signupConfirm}
                        onChange={(e) => setSignupConfirm(e.target.value)}
                        placeholder="Confirm your password"
                        required
                      />
                    </div>

                    <button type="submit" className="btn-signin" disabled={signupLoading}>
                      {signupLoading ? 'Creating account...' : 'Create account'}
                    </button>
                  </form>

                  <p className="switch-line">
                    Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setShowSignup(false); }}>Sign in</a>
                  </p>
                </>
              )}
            </div>
          </div>
        </section>
      </main>


    </div>
  );
}
