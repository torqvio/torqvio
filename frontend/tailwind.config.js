/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Keep your existing colors for backward compatibility
        background: '#0B0F14',
        surface: '#1A1F2E',
        'surface-light': '#252B3D',
        border: '#2A3142',
        primary: '#6C5CE7',
        success: '#00C896',
        error: '#FF4D4F',
        warning: '#FFA500',
        'text-primary': '#FFFFFF',
        'text-secondary': '#9CA3AF',
        'text-muted': '#6B7280',
        
        // Sidebar specific colors
        'sidebar-background': '#0B0F14',
        'sidebar-foreground': '#FFFFFF',
        'sidebar-primary': '#FFFFFF',
        'sidebar-primary-foreground': '#6C5CE7',
        'sidebar-accent': '#252B3D',
        'sidebar-accent-foreground': '#FFFFFF',
        'sidebar-border': '#2A3142',
        'sidebar-ring': '#6C5CE7',
        'foreground-lighter': '#9CA3AF',
        'foreground': '#FFFFFF',
        'destructive-600': '#FF4D4F',
        'border-muted': '#2A3142',
        'border-default': '#2A3142',
        'background-selection': '#252B3D',
        'background-surface-300': '#252B3D',
        
        // Add slate colors for new components
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        
        // Add emerald colors
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        
        // Add gray colors
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        
        // Add teal colors
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
