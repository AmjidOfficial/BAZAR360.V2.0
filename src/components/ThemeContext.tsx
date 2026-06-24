import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('bazar360_theme_engine_mode');
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          return stored;
        }
      } catch (e) {
        console.warn('Storage disabled, utilizing light mode default.');
      }
    }
    return 'dark'; // Default state is Dark Mode (Gateway Space Cyber Dark)
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = () => {
      let active: 'light' | 'dark' = 'light';
      if (theme === 'system') {
        active = mediaQuery.matches ? 'dark' : 'light';
      } else {
        active = theme;
      }
      setResolvedTheme(active);

      // Add/remove classes on the root HTML node
      const root = document.documentElement;
      if (active === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }

      // Sync with old classes if existing styles rely on them
      const oldThemeClass = `theme-luxury-${active}`;
      root.classList.remove('theme-luxury-light', 'theme-cosmic-dark', 'theme-obsidian-gold', 'theme-mint-emerald');
      root.classList.add(active === 'dark' ? 'theme-cosmic-dark' : 'theme-luxury-light');
    };

    updateTheme();

    if (theme === 'system') {
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('bazar360_theme_engine_mode', newTheme);
    } catch (e) {}
  };

  const toggleTheme = () => {
    if (resolvedTheme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
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
