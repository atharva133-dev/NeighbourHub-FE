import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../utils/apiError';
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
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpSuccess, setOtpSuccess] = useState(false);
  
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
      // Show OTP modal instead of navigating
      setOtpEmail(signupEmail);
      setShowOtpModal(true);
      // Reset signup form
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirm('');
      setShowSignup(false);
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
        setShowOtpModal(false);
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
          <div className={`auth-card ${showSignup ? 'flipped' : ''}`}>
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
                  <a className="forgot" href="#">Forgot password?</a>
                </div>

                <button type="submit" className="btn-signin" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <p className="switch-line">
                First time here? <a href="#" onClick={(e) => { e.preventDefault(); setShowSignup(true); }}>Create your account</a>
              </p>
            </div>

            {/* Back - Signup Form */}
            <div className="auth-card-back">
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
            </div>
          </div>
        </section>
      </main>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="otp-modal-overlay">
          <div className="otp-modal">
            {otpSuccess ? (
              <>
                <div className="otp-modal-icon otp-success-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="#1c1a17" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2>Email verified!</h2>
                <p className="otp-modal-sub">Redirecting to your community...</p>
              </>
            ) : (
              <>
                <div className="otp-modal-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="4" width="20" height="16" rx="3" fill="#fdfaf4"/>
                    <path d="M3 6L12 13L21 6" stroke="#c2622f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2>Verify your email</h2>
                <p className="otp-modal-sub">
                  We've sent a 6-digit code to <strong>{otpEmail}</strong>. Enter it below to verify your account.
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
                  onClick={() => setShowOtpModal(false)}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
