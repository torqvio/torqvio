// Enterprise-grade color tokens for Torqvio Trust Machine
// Designed for trust, value visualization, and psychological engagement

export const colors = {
  // Trust & Primary Brand Colors
  trust: {
    primary: '#0066FF',
    light: '#E6F0FF',
    lighter: '#F0F7FF',
    dark: '#0044CC',
    darker: '#003399',
    50: '#F0F7FF',
    100: '#E6F0FF',
    200: '#CCE0FF',
    300: '#99C0FF',
    400: '#66A0FF',
    500: '#0066FF',
    600: '#0052CC',
    700: '#0044CC',
    800: '#003399',
    900: '#002266',
  },

  // Success & Recovery Colors
  success: {
    primary: '#00C896',
    light: '#E6FFF9',
    lighter: '#F0FFFD',
    dark: '#00A67C',
    darker: '#008466',
    50: '#F0FFFD',
    100: '#E6FFF9',
    200: '#CCFFF3',
    300: '#99FFE6',
    400: '#66FFCC',
    500: '#00C896',
    600: '#00A67C',
    700: '#008466',
    800: '#00664D',
    900: '#004433',
  },

  // Urgency & Alert Colors
  urgency: {
    primary: '#FF6B35',
    light: '#FFF4ED',
    lighter: '#FFF8F5',
    dark: '#E55A2B',
    darker: '#CC4A1F',
    50: '#FFF8F5',
    100: '#FFF4ED',
    200: '#FFE9DB',
    300: '#FFD3B8',
    400: '#FFB894',
    500: '#FF6B35',
    600: '#E55A2B',
    700: '#CC4A1F',
    800: '#B33A13',
    900: '#992A00',
  },

  // Warning Colors
  warning: {
    primary: '#F59E0B',
    light: '#FEF3C7',
    lighter: '#FFFBEB',
    dark: '#D97706',
    darker: '#B45309',
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBB024',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Error Colors
  error: {
    primary: '#EF4444',
    light: '#FEE2E2',
    lighter: '#FEF2F2',
    dark: '#DC2626',
    darker: '#B91C1C',
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Enterprise Neutral Palette
  enterprise: {
    surface: '#FFFFFF',
    background: '#F8FAFC',
    backgroundSecondary: '#F1F5F9',
    border: '#E2E8F0',
    borderSecondary: '#CBD5E1',
    text: {
      primary: '#1A202C',
      secondary: '#4A5568',
      tertiary: '#718096',
      muted: '#A0AEC0',
      inverse: '#FFFFFF',
    },
    gray: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    }
  },

  // Gamification Colors
  gamification: {
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
    diamond: '#B9F2FF',
    platinum: '#E5E4E2',
    emerald: '#50C878',
  },

  // Status Colors
  status: {
    online: '#10B981',
    offline: '#6B7280',
    busy: '#F59E0B',
    away: '#EF4444',
  },

  // Chart & Data Visualization Colors
  charts: [
    '#0066FF', // Trust Blue
    '#00C896', // Success Green  
    '#FF6B35', // Urgency Orange
    '#F59E0B', // Warning Amber
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange
  ],

  // Dark Mode Overrides
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceSecondary: '#334155',
    border: '#475569',
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
      tertiary: '#94A3B8',
      muted: '#64748B',
      inverse: '#1A202C',
    }
  }
};

// Semantic color mappings for specific use cases
export const semanticColors = {
  // Value visualization
  value: {
    positive: colors.success.primary,
    negative: colors.error.primary,
    neutral: colors.enterprise.gray[500],
    background: colors.success.light,
  },

  // Trust indicators
  trust: {
    excellent: colors.success.primary,
    good: colors.trust.primary,
    warning: colors.warning.primary,
    critical: colors.error.primary,
  },

  // Risk levels
  risk: {
    low: colors.success.primary,
    medium: colors.warning.primary,
    high: colors.urgency.primary,
    critical: colors.error.primary,
  },

  // Recovery status
  recovery: {
    active: colors.success.primary,
    pending: colors.warning.primary,
    failed: colors.error.primary,
    completed: colors.success.dark,
  },

  // Gamification
  achievement: {
    common: colors.enterprise.gray[500],
    rare: colors.trust.primary,
    epic: colors.warning.primary,
    legendary: colors.gamification.gold,
  }
};

// CSS custom properties for runtime theme switching
export const cssVariables = {
  '--color-trust-primary': colors.trust.primary,
  '--color-trust-light': colors.trust.light,
  '--color-trust-dark': colors.trust.dark,
  
  '--color-success-primary': colors.success.primary,
  '--color-success-light': colors.success.light,
  '--color-success-dark': colors.success.dark,
  
  '--color-urgency-primary': colors.urgency.primary,
  '--color-urgency-light': colors.urgency.light,
  '--color-urgency-dark': colors.urgency.dark,
  
  '--color-warning-primary': colors.warning.primary,
  '--color-warning-light': colors.warning.light,
  '--color-warning-dark': colors.warning.dark,
  
  '--color-error-primary': colors.error.primary,
  '--color-error-light': colors.error.light,
  '--color-error-dark': colors.error.dark,
  
  '--color-surface': colors.enterprise.surface,
  '--color-background': colors.enterprise.background,
  '--color-border': colors.enterprise.border,
  
  '--color-text-primary': colors.enterprise.text.primary,
  '--color-text-secondary': colors.enterprise.text.secondary,
  '--color-text-muted': colors.enterprise.text.muted,
  
  '--color-gamification-gold': colors.gamification.gold,
  '--color-gamification-silver': colors.gamification.silver,
  '--color-gamification-bronze': colors.gamification.bronze,
};
