'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { colors, cssVariables, semanticColors } from '@/tokens/colors';
import { typography, typographyCSSVariables } from '@/tokens/typography';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: typeof colors;
  semanticColors: typeof semanticColors;
  typography: typeof typography;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'light' }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isDark, setIsDark] = useState(false);

  // Apply CSS variables and theme classes
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply color variables
    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, String(value));
    });
    
    // Apply typography variables
    Object.entries(typographyCSSVariables).forEach(([key, value]) => {
      root.style.setProperty(key, String(value));
    });
    
    // Apply theme class
    root.classList.remove('light', 'dark');
    
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDark(mediaQuery.matches);
      root.classList.add(mediaQuery.matches ? 'dark' : 'light');
      
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDark(e.matches);
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setIsDark(theme === 'dark');
      root.classList.add(theme);
    }
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    colors: isDark ? { ...colors, dark: colors.dark } : colors,
    semanticColors,
    typography,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook for accessing theme-aware colors
export function useThemeColors() {
  const { colors, semanticColors, isDark } = useTheme();
  
  return {
    // Primary colors
    primary: colors.trust.primary,
    primaryLight: colors.trust.light,
    primaryDark: colors.trust.dark,
    
    // Success colors
    success: colors.success.primary,
    successLight: colors.success.light,
    successDark: colors.success.dark,
    
    // Urgency colors
    urgency: colors.urgency.primary,
    urgencyLight: colors.urgency.light,
    urgencyDark: colors.urgency.dark,
    
    // Warning colors
    warning: colors.warning.primary,
    warningLight: colors.warning.light,
    warningDark: colors.warning.dark,
    
    // Error colors
    error: colors.error.primary,
    errorLight: colors.error.light,
    errorDark: colors.error.dark,
    
    // Enterprise colors
    surface: isDark ? colors.dark.surface : colors.enterprise.surface,
    background: isDark ? colors.dark.background : colors.enterprise.background,
    backgroundSecondary: colors.enterprise.backgroundSecondary,
    border: isDark ? colors.dark.border : colors.enterprise.border,
    borderSecondary: colors.enterprise.borderSecondary,
    
    // Text colors
    textPrimary: isDark ? colors.dark.text.primary : colors.enterprise.text.primary,
    textSecondary: isDark ? colors.dark.text.secondary : colors.enterprise.text.secondary,
    textTertiary: isDark ? colors.dark.text.tertiary : colors.enterprise.text.tertiary,
    textMuted: isDark ? colors.dark.text.muted : colors.enterprise.text.muted,
    textInverse: colors.enterprise.text.inverse,
    
    // Semantic colors
    semantic: semanticColors,
    
    // Gamification colors
    gold: colors.gamification.gold,
    silver: colors.gamification.silver,
    bronze: colors.gamification.bronze,
    diamond: colors.gamification.diamond,
    platinum: colors.gamification.platinum,
    emerald: colors.gamification.emerald,
    
    // Chart colors
    charts: colors.charts,
  };
}

// Hook for accessing typography
export function useTypography() {
  const { typography } = useTheme();
  return typography;
}
