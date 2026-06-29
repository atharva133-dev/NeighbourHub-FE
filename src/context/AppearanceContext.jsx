import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'neighbourhub-appearance';

export const ACCENT_COLORS = {
  purple: { primary: '#9333ea', secondary: '#2563eb', label: 'Purple' },
  blue: { primary: '#2563eb', secondary: '#0891b2', label: 'Blue' },
  green: { primary: '#16a34a', secondary: '#059669', label: 'Green' },
  rose: { primary: '#e11d48', secondary: '#db2777', label: 'Rose' },
};

const DEFAULT_APPEARANCE = {
  theme: 'dark',
  accentColor: 'purple',
  fontSize: 'medium',
  compactView: false,
};

const AppearanceContext = createContext(null);

function applyAppearance(settings) {
  const root = document.documentElement;
  const accent = ACCENT_COLORS[settings.accentColor] || ACCENT_COLORS.purple;

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
