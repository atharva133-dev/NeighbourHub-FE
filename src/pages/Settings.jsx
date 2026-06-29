import { useState } from 'react';
import { User, KeyRound, Palette, Bell, Shield, Info } from 'lucide-react';
import Layout from '../components/Layout';
import ProfileSection from '../components/settings/ProfileSection';
import AccountSection from '../components/settings/AccountSection';
import AppearanceSection from '../components/settings/AppearanceSection';
import NotificationsSection from '../components/settings/NotificationsSection';
import PrivacySection from '../components/settings/PrivacySection';
import AboutSection from '../components/settings/AboutSection';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: KeyRound },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'about', label: 'About', icon: Info },
];

const SECTIONS = {
  profile: ProfileSection,
  account: AccountSection,
  appearance: AppearanceSection,
  notifications: NotificationsSection,
  privacy: PrivacySection,
  about: AboutSection,
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const ActiveSection = SECTIONS[activeTab];

  return (
    <Layout>
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Settings</h1>

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="glass-card overflow-hidden rounded-2xl p-3 shadow-sm border border-slate-200 bg-white/60 dark:border-white/10 dark:bg-[#13131f]/60">
              <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0 scrollbar-hide">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 lg:w-full ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25 scale-[1.02]'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </nav>
          </aside>

          <main className="animate-fade-in">
            <ActiveSection />
          </main>
        </div>
      </div>
    </Layout>
  );
}
