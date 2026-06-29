import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { ACCENT_COLORS, useAppearance } from '../../context/AppearanceContext';
import ToggleSwitch from './ToggleSwitch';

const FONT_SIZES = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
];

export default function AppearanceSection() {
  const { appearance, setAppearance } = useAppearance();

  const handleSave = () => {
    toast.success('Appearance saved');
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">Appearance</h2>
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">Customize how NeighbourHub looks for you</p>

      <div className="space-y-6">
        <div>
          <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-slate-200">Theme</label>
          <div className="flex flex-wrap gap-3">
            {['dark', 'light'].map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => setAppearance({ theme })}
                className={`rounded-xl border px-5 py-2.5 text-sm font-bold capitalize transition-all duration-300 ${
                  appearance.theme === theme
                    ? 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/20 dark:text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-slate-200">Accent Color</label>
          <div className="flex flex-wrap gap-3">
            {Object.entries(ACCENT_COLORS).map(([key, { primary, label }]) => (
              <button
                key={key}
                type="button"
                onClick={() => setAppearance({ accentColor: key })}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                  appearance.accentColor === key
                    ? 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/20 dark:text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5'
                }`}
              >
                <span
                  className="h-4 w-4 rounded-full shadow-sm"
                  style={{ backgroundColor: primary }}
                />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-slate-200">Font Size</label>
          <div className="flex flex-wrap gap-3">
            {FONT_SIZES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setAppearance({ fontSize: id })}
                className={`rounded-xl border px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
                  appearance.fontSize === id
                    ? 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/20 dark:text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 dark:border-white/10 dark:bg-white/5">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Compact View</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Reduce spacing in the notice feed</p>
          </div>
          <ToggleSwitch
            checked={appearance.compactView}
            onChange={(val) => setAppearance({ compactView: val })}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="mt-8 flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-purple-500/40"
      >
        <Save className="h-4 w-4" />
        Save Appearance
      </button>
    </div>
  );
}
