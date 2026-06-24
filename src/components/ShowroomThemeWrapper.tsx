import React from 'react';

export interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  bgStyle?: 'dark' | 'light' | 'emerald' | 'gold';
  borderStyle?: string;
}

interface ShowroomThemeWrapperProps {
  themeConfig?: ThemeConfig;
  children: React.ReactNode;
}

export const ShowroomThemeWrapper: React.FC<ShowroomThemeWrapperProps> = ({
  themeConfig,
  children,
}) => {
  if (!themeConfig) {
    return <>{children}</>;
  }

  // Resolve showroom brand styles
  const primaryColor = themeConfig.primaryColor || '#c5a880';
  const secondaryColor = themeConfig.secondaryColor || '#121215';
  const fontFamily = themeConfig.fontFamily || 'Inter, sans-serif';
  const bgStyle = themeConfig.bgStyle || 'dark';

  // Compute color configurations to inject as CSS variables overriding global tokens locally
  let bgPrimary = '#0a0a0c';
  let bgSecondary = '#121215';
  let textMain = '#fafafa';
  let textMuted = '#a1a1aa';
  let borderMain = 'rgba(255, 255, 255, 0.05)';

  if (bgStyle === 'light') {
    bgPrimary = '#fafafa';
    bgSecondary = '#ffffff';
    textMain = '#0c0a09';
    textMuted = '#57534e';
    borderMain = '#e7e5e4';
  } else if (bgStyle === 'emerald') {
    bgPrimary = '#03140F';
    bgSecondary = '#08211a';
    textMain = '#e2f0ec';
    textMuted = '#5e8a7f';
    borderMain = 'rgba(16, 185, 129, 0.15)';
  } else if (bgStyle === 'gold') {
    bgPrimary = '#050505';
    bgSecondary = '#0f0f12';
    textMain = '#f4f4f5';
    textMuted = '#8e8e93';
    borderMain = 'rgba(217, 119, 6, 0.20)';
  }

  // Map variables dynamically onto the element container scope
  const wrapperStyle = {
    '--color-bg-primary': bgPrimary,
    '--color-bg-secondary': bgSecondary,
    '--color-text-main': textMain,
    '--color-text-muted': textMuted,
    '--color-border-main': borderMain,
    '--color-accent-main': primaryColor,
    '--color-accent-hover': primaryColor,
    fontFamily: fontFamily,
  } as React.CSSProperties;

  return (
    <div 
      style={wrapperStyle} 
      className="min-h-screen bg-bg-primary text-text-main transition-all duration-300"
    >
      {children}
    </div>
  );
};
