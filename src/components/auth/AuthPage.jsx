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
    <div className="auth-split-screen flex min-h-screen bg-slate-50 dark:bg-[#0f0f1a] transition-colors duration-500">
      <div className="auth-gradient-panel hidden w-1/2 lg:block relative overflow-hidden">
        <AuthVisualPanel />
      </div>

      <div className="auth-form-panel animated-auth-bg flex w-full flex-col items-center justify-center px-4 py-10 lg:w-1/2 lg:bg-white dark:lg:bg-[#0f0f1a]">
        <div className="mb-8 flex w-full max-w-md items-center justify-center gap-3 lg:hidden">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-lg font-extrabold text-white shadow-lg shadow-purple-500/30">
            NH
          </span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">NeighbourHub</span>
        </div>

        <div className="auth-card-slide glass-card w-full max-w-md overflow-hidden p-8 border border-slate-200 bg-white/60 dark:border-white/10 dark:bg-white/5">
          <div className="mb-8 flex rounded-xl bg-slate-100 p-1 dark:bg-white/5">
            <button
              type="button"
              onClick={() => switchTab('login')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all duration-300 ${
                activeTab === 'login'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-gradient-to-r dark:from-purple-600 dark:to-blue-600 dark:text-white dark:shadow-purple-500/25'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchTab('register')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all duration-300 ${
                activeTab === 'register'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-gradient-to-r dark:from-purple-600 dark:to-blue-600 dark:text-white dark:shadow-purple-500/25'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          <div className="auth-tab-content relative">
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
                <RegisterForm onSwitchToLogin={() => switchTab('login')} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
