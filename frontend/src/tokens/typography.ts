// Enterprise-grade typography tokens for Torqvio Trust Machine
// Optimized for hierarchy, readability, and emotional impact

export const typography = {
  // Killer Line - The primary value statement
  killer: {
    fontSize: '3.5rem',
    fontWeight: 800,
    lineHeight: '1.1',
    letterSpacing: '-0.02em',
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  // Trust Score - Secondary value indicator
  trust: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: '1.2',
    letterSpacing: '-0.01em',
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  // Page Headers
  h1: {
    fontSize: '2.25rem',
    fontWeight: 700,
    lineHeight: '1.2',
    letterSpacing: '-0.01em',
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  // Section Headers
  h2: {
    fontSize: '1.875rem',
    fontWeight: 600,
    lineHeight: '1.3',
    letterSpacing: '-0.005em',
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  // Component Headers
  h3: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: '1.4',
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  // Card Headers
  h4: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: '1.4',
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  // Small Headers
  h5: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: '1.4',
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  // Body Text
  body: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: '1.6',
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  // Large Body Text
  bodyLarge: {
    fontSize: '1.125rem',
    fontWeight: 400,
    lineHeight: '1.6',
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  // Small Body Text
  bodySmall: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: '1.5',
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  // Caption Text
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: '1.4',
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  // Value Display (for currency, metrics)
  value: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: '1.2',
    letterSpacing: '-0.01em',
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  // Value Display Large
  valueLarge: {
    fontSize: '3rem',
    fontWeight: 800,
    lineHeight: '1.1',
    letterSpacing: '-0.02em',
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  // Value Display Small
  valueSmall: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: '1.3',
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  // Badge/Label Text
  label: {
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: '1.4',
    letterSpacing: '0.05em',
    fontFamily: "'Inter', system-ui, sans-serif",
    textTransform: 'uppercase' as const,
  },

  // Button Text
  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '1.4',
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  // Button Large Text
  buttonLarge: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: '1.4',
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  // Button Small Text
  buttonSmall: {
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: '1.4',
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  // Navigation Text
  nav: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '1.4',
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  // Code/Technical Text
  code: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: '1.5',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', monospace",
  },

  // Code Small
  codeSmall: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: '1.4',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', monospace",
  },

  // Monospace for data
  mono: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: '1.5',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', monospace",
  },
};

// Responsive typography scales
export const responsiveTypography = {
  killer: {
    mobile: { fontSize: '2.5rem', fontWeight: 800 },
    tablet: { fontSize: '3rem', fontWeight: 800 },
    desktop: { fontSize: '3.5rem', fontWeight: 800 },
    large: { fontSize: '4rem', fontWeight: 800 },
  },

  trust: {
    mobile: { fontSize: '2rem', fontWeight: 700 },
    tablet: { fontSize: '2.25rem', fontWeight: 700 },
    desktop: { fontSize: '2.5rem', fontWeight: 700 },
    large: { fontSize: '3rem', fontWeight: 700 },
  },

  h1: {
    mobile: { fontSize: '1.875rem', fontWeight: 700 },
    tablet: { fontSize: '2rem', fontWeight: 700 },
    desktop: { fontSize: '2.25rem', fontWeight: 700 },
    large: { fontSize: '2.5rem', fontWeight: 700 },
  },

  h2: {
    mobile: { fontSize: '1.5rem', fontWeight: 600 },
    tablet: { fontSize: '1.625rem', fontWeight: 600 },
    desktop: { fontSize: '1.875rem', fontWeight: 600 },
    large: { fontSize: '2rem', fontWeight: 600 },
  },

  h3: {
    mobile: { fontSize: '1.25rem', fontWeight: 600 },
    tablet: { fontSize: '1.375rem', fontWeight: 600 },
    desktop: { fontSize: '1.5rem', fontWeight: 600 },
    large: { fontSize: '1.625rem', fontWeight: 600 },
  },
};

// Typography utilities for specific use cases
export const typographyUtils = {
  // Truncate text with ellipsis
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  } as const,

  // Line clamp for multi-line truncation
  lineClamp: (lines: number) => ({
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  }),

  // Anti-aliased text rendering
  antialiased: {
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  },

  // Subpixel rendering for crisp text
  subpixel: {
    WebkitFontSmoothing: 'auto',
    MozOsxFontSmoothing: 'auto',
  },
};

// Font loading optimization
export const fontDisplay = 'swap';

// Preload critical fonts
export const criticalFonts = [
  "'Inter', system-ui, sans-serif",
  "'JetBrains Mono', 'Fira Code', 'Monaco', monospace",
];

// CSS custom properties for typography
export const typographyCSSVariables = {
  '--font-killer': typography.killer.fontSize,
  '--font-killer-weight': typography.killer.fontWeight,
  '--font-killer-line-height': typography.killer.lineHeight,
  '--font-killer-letter-spacing': typography.killer.letterSpacing,
  
  '--font-trust': typography.trust.fontSize,
  '--font-trust-weight': typography.trust.fontWeight,
  '--font-trust-line-height': typography.trust.lineHeight,
  
  '--font-h1': typography.h1.fontSize,
  '--font-h1-weight': typography.h1.fontWeight,
  '--font-h1-line-height': typography.h1.lineHeight,
  
  '--font-h2': typography.h2.fontSize,
  '--font-h2-weight': typography.h2.fontWeight,
  '--font-h2-line-height': typography.h2.lineHeight,
  
  '--font-h3': typography.h3.fontSize,
  '--font-h3-weight': typography.h3.fontWeight,
  '--font-h3-line-height': typography.h3.lineHeight,
  
  '--font-body': typography.body.fontSize,
  '--font-body-weight': typography.body.fontWeight,
  '--font-body-line-height': typography.body.lineHeight,
  
  '--font-body-small': typography.bodySmall.fontSize,
  '--font-body-small-weight': typography.bodySmall.fontWeight,
  '--font-body-small-line-height': typography.bodySmall.lineHeight,
  
  '--font-caption': typography.caption.fontSize,
  '--font-caption-weight': typography.caption.fontWeight,
  '--font-caption-line-height': typography.caption.lineHeight,
  
  '--font-value': typography.value.fontSize,
  '--font-value-weight': typography.value.fontWeight,
  '--font-value-line-height': typography.value.lineHeight,
  
  '--font-label': typography.label.fontSize,
  '--font-label-weight': typography.label.fontWeight,
  '--font-label-line-height': typography.label.lineHeight,
  
  '--font-button': typography.button.fontSize,
  '--font-button-weight': typography.button.fontWeight,
  '--font-button-line-height': typography.button.lineHeight,
  
  '--font-family-primary': typography.killer.fontFamily,
  '--font-family-mono': typography.code.fontFamily,
};
