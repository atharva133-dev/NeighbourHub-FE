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
      <h2 className="mb-2 text-xl font-semibold text-white">Appearance</h2>
      <p className="mb-6 text-sm text-slate-400">Customize how NeighbourHub looks for you</p>

      <div className="space-y-6">
        <div>
          <label className="mb-3 block text-sm font-medium text-slate-200">Theme</label>
          <div className="flex flex-wrap gap-3">
            {['dark', 'light'].map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => setAppearance({ theme })}
                className={`rounded-xl border px-5 py-2.5 text-sm font-medium capitalize transition ${
                  appearance.theme === theme
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-white/10 text-slate-300 hover:bg-white/5'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-slate-200">Accent Color</label>
          <div className="flex flex-wrap gap-3">
            {Object.entries(ACCENT_COLORS).map(([key, { primary, label }]) => (
              <button
                key={key}
                type="button"
                onClick={() => setAppearance({ accentColor: key })}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                  appearance.accentColor === key
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-white/10 text-slate-300 hover:bg-white/5'
                }`}
              >
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: primary }}
                />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-slate-200">Font Size</label>
          <div className="flex flex-wrap gap-3">
            {FONT_SIZES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setAppearance({ fontSize: id })}
                className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition ${
                  appearance.fontSize === id
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-white/10 text-slate-300 hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-white">Compact View</p>
            <p className="text-xs text-slate-400">Reduce spacing in the notice feed</p>
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
        className="mt-6 flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:-translate-y-0.5"
      >
        <Save className="h-4 w-4" />
        Save Appearance
      </button>
    </div>
  );
}
