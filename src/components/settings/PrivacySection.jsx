import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import ToggleSwitch from './ToggleSwitch';

const PRIVACY_OPTIONS = [
  { key: 'showName', label: 'Show Name', description: 'Display your name on notices and comments' },
  { key: 'publicProfile', label: 'Public Profile', description: 'Allow others to view your profile' },
  { key: 'onlineStatus', label: 'Online Status', description: 'Show when you are active on the board' },
];

const DEFAULT_SETTINGS = {
  showName: true,
  publicProfile: true,
  onlineStatus: true,
};

export default function PrivacySection() {
  const { user, setUser } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.privacySettings) {
      setSettings({ ...DEFAULT_SETTINGS, ...user.privacySettings });
    }
  }, [user]);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await api.patch('/users/settings', {
        privacySettings: settings,
      });
      setUser(data);
      toast.success('Privacy settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save privacy settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">Privacy</h2>
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">Control your visibility on NeighbourHub</p>

      <div className="space-y-4">
        {PRIVACY_OPTIONS.map(({ key, label, description }) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 dark:border-white/10 dark:bg-white/5"
          >
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
            </div>
            <ToggleSwitch checked={settings[key]} onChange={() => handleToggle(key)} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="mt-8 flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-purple-500/40 disabled:opacity-60 disabled:hover:translate-y-0"
      >
        <Save className="h-4 w-4" />
        {loading ? 'Saving...' : 'Save Privacy Settings'}
      </button>
    </div>
  );
}
