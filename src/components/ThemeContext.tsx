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
    } catch (e) {}
    return 'light'; // Default to light theme by default as requested by user
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
      root.style.setProperty('--color-bg-primary', '#FAFAFA');
      root.style.setProperty('--color-bg-secondary', '#FFFFFF');
      root.style.setProperty('--color-text-main', '#0F172A');
      root.style.setProperty('--color-text-muted', '#64748B');
      root.style.setProperty('--color-border-main', '#E2E8F0');
      root.style.setProperty('--color-accent-main', '#F97316');
      root.style.setProperty('--color-accent-hover', '#EA580C');

      // Align brand and legacy properties
      root.style.setProperty('--brand-bg', '#FAFAFA');
      root.style.setProperty('--brand-text', '#0F172A');
      root.style.setProperty('--brand-text-muted', '#64748B');
      root.style.setProperty('--brand-card', '#FFFFFF');
      root.style.setProperty('--brand-border', '#E2E8F0');
      root.style.setProperty('--brand-accent', '#F97316');
      root.style.setProperty('--brand-accent-hover', '#EA580C');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
      root.classList.remove('theme-luxury-light', 'theme-obsidian-gold', 'theme-mint-emerald');
      root.classList.add('theme-cosmic-dark');

      // Direct overrides for the premium dark charcoal look
      root.style.setProperty('--color-bg-primary', '#121214');
      root.style.setProperty('--color-bg-secondary', '#1E1E22');
      root.style.setProperty('--color-text-main', '#F4F4F5');
      root.style.setProperty('--color-text-muted', '#A1A1AA');
      root.style.setProperty('--color-border-main', 'rgba(255, 255, 255, 0.08)');
      root.style.setProperty('--color-accent-main', '#F97316');
      root.style.setProperty('--color-accent-hover', '#EA580C');

      root.style.setProperty('--brand-bg', '#121214');
      root.style.setProperty('--brand-text', '#F4F4F5');
      root.style.setProperty('--brand-text-muted', '#A1A1AA');
      root.style.setProperty('--brand-card', '#1E1E22');
      root.style.setProperty('--brand-border', 'rgba(255, 255, 255, 0.08)');
      root.style.setProperty('--brand-accent', '#F97316');
      root.style.setProperty('--brand-accent-hover', '#EA580C');
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

