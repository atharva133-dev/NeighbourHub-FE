import { useState } from 'react';
import { User, KeyRound, Palette, Bell, Shield, Info, ShieldCheck, Briefcase } from 'lucide-react';
import Layout from '../components/Layout';
import ProfileSection from '../components/settings/ProfileSection';
import AccountSection from '../components/settings/AccountSection';
import AppearanceSection from '../components/settings/AppearanceSection';
import NotificationsSection from '../components/settings/NotificationsSection';
import PrivacySection from '../components/settings/PrivacySection';
import AboutSection from '../components/settings/AboutSection';
import ModerationSection from '../components/settings/ModerationSection';
import HelpersSection from '../components/helpers/HelpersSection';
import { useAuth } from '../context/AuthContext';

const BASE_TABS = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'account',       label: 'Account',        icon: KeyRound },
  { id: 'appearance',    label: 'Appearance',     icon: Palette },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'privacy',       label: 'Privacy',        icon: Shield },
  { id: 'helpers',       label: 'Helpers',       icon: Briefcase },
  { id: 'about',         label: 'About',          icon: Info },
];

const ADMIN_TABS = [
  { id: 'moderation', label: 'Moderation', icon: ShieldCheck },
];

const SECTIONS = {
  profile:       ProfileSection,
  account:       AccountSection,
  appearance:    AppearanceSection,
  notifications: NotificationsSection,
  privacy:       PrivacySection,
  helpers:       HelpersSection,
  about:         AboutSection,
  moderation:    ModerationSection,
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [...BASE_TABS, ...ADMIN_TABS];
  const ActiveSection = SECTIONS[activeTab] || ProfileSection;

  return (
    <Layout>
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Settings</h1>

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="glass-card overflow-hidden rounded-2xl p-3 shadow-sm border border-slate-200 bg-white/60 dark:border-white/10 dark:bg-[#13131f]/60">
              <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0 scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 lg:w-full ${
                        isActive
                          ? 'bg-gradient-to-r from-[#6E8F73] to-[#C97B5A] text-white shadow-lg shadow-[#6E8F73]/25 scale-[1.02]'
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
