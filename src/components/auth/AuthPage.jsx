import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthVisualPanel from './AuthVisualPanel';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function AuthPage({ initialTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const navigate = useNavigate();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    navigate(tab === 'login' ? '/login' : '/register', { replace: true });
  };

  return (
    <div className="auth-split-screen flex min-h-screen">
      <div className="auth-gradient-panel hidden w-1/2 lg:block">
        <AuthVisualPanel />
      </div>

      <div className="auth-form-panel animated-auth-bg flex w-full flex-col items-center justify-center px-4 py-10 lg:w-1/2 lg:bg-[#0f0f1a]">
        <div className="mb-6 flex w-full max-w-md items-center justify-center gap-2 lg:hidden">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-700 text-sm font-bold text-white">
            NH
          </span>
          <span className="text-xl font-bold text-white">NeighbourHub</span>
        </div>

        <div className="auth-card-slide glass-card w-full max-w-md overflow-hidden p-8">
          <div className="mb-6 flex rounded-xl bg-white/5 p-1">
            <button
              type="button"
              onClick={() => switchTab('login')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-300 ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchTab('register')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-300 ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          <div className="auth-tab-content relative">
            <div
              className={`transition-all duration-300 ${
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
              className={`transition-all duration-300 ${
                activeTab === 'register'
                  ? 'opacity-100 translate-x-0'
                  : 'pointer-events-none absolute inset-0 opacity-0 translate-x-4'
              }`}
            >
              {activeTab === 'register' && (
                <RegisterForm onSwitchToLogin={() => switchTab('login')} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
