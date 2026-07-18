import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'neighbourhub-appearance';

export const ACCENT_COLORS = {
  sage: { primary: '#6E8F73', secondary: '#C97B5A', label: 'Sage & Clay' },
  clay: { primary: '#C97B5A', secondary: '#A8442F', label: 'Clay & Brick' },
  brick: { primary: '#A8442F', secondary: '#6E8F73', label: 'Brick & Sage' },
  forest: { primary: '#4E6B54', secondary: '#6E8F73', label: 'Forest' },
};

const DEFAULT_APPEARANCE = {
  theme: 'light',
  accentColor: 'sage',
  fontSize: 'medium',
  compactView: false,
};

const AppearanceContext = createContext(null);

function applyAppearance(settings) {
  const root = document.documentElement;

  // Apply Theme
  if (settings.theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  const accent = ACCENT_COLORS[settings.accentColor] || ACCENT_COLORS.sage;

  root.dataset.theme = settings.theme;
  root.dataset.fontSize = settings.fontSize;
  root.dataset.compact = settings.compactView ? 'true' : 'false';
  root.style.setProperty('--accent-primary', accent.primary);
  root.style.setProperty('--accent-secondary', accent.secondary);
}

export function AppearanceProvider({ children }) {
  const [appearance, setAppearanceState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_APPEARANCE, ...JSON.parse(stored) } : DEFAULT_APPEARANCE;
    } catch {
      return DEFAULT_APPEARANCE;
    }
  });

  useEffect(() => {
    applyAppearance(appearance);
  }, [appearance]);

  const setAppearance = (updates) => {
    setAppearanceState((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <AppearanceContext.Provider value={{ appearance, setAppearance }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export const useAppearance = () => useContext(AppearanceContext);
