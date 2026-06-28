import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeType = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeType;
  resolvedTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    try {
      const saved = localStorage.getItem('bazar360_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      
      // Check system preference
      if (typeof window !== 'undefined' && window.matchMedia) {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return systemPrefersDark ? 'dark' : 'light';
      }
    } catch (e) {}
    return 'light'; // Default to light
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      root.classList.remove('theme-cosmic-dark', 'theme-obsidian-gold', 'theme-mint-emerald');
      root.classList.add('theme-luxury-light');

      // Persist the custom Light theme variables globally so they are standard and cover all components
      root.style.setProperty('--color-bg-primary', '#ffffff');
      root.style.setProperty('--color-bg-secondary', '#f1f5f9');
      root.style.setProperty('--color-text-main', '#0f172a');
      root.style.setProperty('--color-text-muted', '#475569');
      root.style.setProperty('--color-border-main', '#cbd5e1');
      root.style.setProperty('--color-accent-main', '#1e40af');
      root.style.setProperty('--color-accent-hover', '#1d4ed8');

      // Align brand and legacy properties
      root.style.setProperty('--brand-bg', '#ffffff');
      root.style.setProperty('--brand-text', '#0f172a');
      root.style.setProperty('--brand-text-muted', '#475569');
      root.style.setProperty('--brand-card', '#f1f5f9');
      root.style.setProperty('--brand-border', '#cbd5e1');
      root.style.setProperty('--brand-accent', '#1e40af');
      root.style.setProperty('--brand-accent-hover', '#1d4ed8');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
      root.classList.remove('theme-luxury-light', 'theme-obsidian-gold', 'theme-mint-emerald');
      root.classList.add('theme-cosmic-dark');

      // Clear overrides to let ThemeEngine or CSS stylesheets apply dark presets
      root.style.removeProperty('--color-bg-primary');
      root.style.removeProperty('--color-bg-secondary');
      root.style.removeProperty('--color-text-main');
      root.style.removeProperty('--color-text-muted');
      root.style.removeProperty('--color-border-main');
      root.style.removeProperty('--color-accent-main');
      root.style.removeProperty('--color-accent-hover');

      root.style.removeProperty('--brand-bg');
      root.style.removeProperty('--brand-text');
      root.style.removeProperty('--brand-text-muted');
      root.style.removeProperty('--brand-card');
      root.style.removeProperty('--brand-border');
      root.style.removeProperty('--brand-accent');
      root.style.removeProperty('--brand-accent-hover');
    }
    
    try {
      localStorage.setItem('bazar360_theme', theme);
    } catch (e) {}
  }, [theme]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

