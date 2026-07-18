import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Auth3DVisualPanel from './Auth3DVisualPanel';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import OtpVerificationForm from './OtpVerificationForm';

export default function AuthPage({ initialTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [pendingEmail, setPendingEmail] = useState(null); // set after register → show OTP screen
  const navigate = useNavigate();

  useEffect(() => {
    setActiveTab(initialTab);
    setPendingEmail(null);
  }, [initialTab]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setPendingEmail(null);
    navigate(tab === 'login' ? '/login' : '/register', { replace: true });
  };

  // Called by RegisterForm on success
  const handleRegistered = (email) => {
    setPendingEmail(email);
  };

  // Called by OtpVerificationForm "Go back"
  const handleBackFromOtp = () => {
    setPendingEmail(null);
    setActiveTab('register');
  };

  return (
    <div className="auth-split-screen flex min-h-screen bg-white transition-colors duration-500">
      <div className="hidden w-1/2 lg:block relative overflow-hidden">
        <Auth3DVisualPanel />
      </div>

      <div className="auth-form-panel animated-auth-bg flex w-full flex-col items-center justify-center px-4 py-10 lg:w-1/2 bg-white">
        <div className="mb-8 flex w-full max-w-md items-center justify-center gap-3 lg:hidden">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg shadow-purple-500/30 overflow-hidden bg-slate-100">
            <img src="/logo2.png" alt="NeighbourHub Logo" className="h-full w-full object-contain p-1.5" />
          </span>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">NeighbourHub</span>
        </div>

        <div className="auth-card-slide glass-card w-full max-w-md overflow-hidden p-8 border border-slate-200 bg-white">
          {/* Hide tab switcher during OTP step */}
          {!pendingEmail && (
            <div className="mb-8 flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => switchTab('login')}
                className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all duration-300 ${
                  activeTab === 'login'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchTab('register')}
                className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all duration-300 ${
                  activeTab === 'register'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Register
              </button>
            </div>
          )}

          <div className="auth-tab-content relative">
            {pendingEmail ? (
              <OtpVerificationForm
                email={pendingEmail}
                onBack={handleBackFromOtp}
              />
            ) : (
              <>
                <div
                  className={`transition-all duration-500 ${
                    activeTab === 'login'
                      ? 'opacity-100 translate-x-0'
                      : 'pointer-events-none absolute inset-0 opacity-0 -translate-x-4'
                  }`}
                >
                  {activeTab === 'login' && (
                    <LoginForm onSwitchToRegister={() => switchTab('register')} />
                  )}
                </div>
                <div
                  className={`transition-all duration-500 ${
                    activeTab === 'register'
                      ? 'opacity-100 translate-x-0'
                      : 'pointer-events-none absolute inset-0 opacity-0 translate-x-4'
                  }`}
                >
                  {activeTab === 'register' && (
                    <RegisterForm
                      onSwitchToLogin={() => switchTab('login')}
                      onRegistered={handleRegistered}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
