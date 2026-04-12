import daisyui from 'daisyui';
import defaultTheme from 'tailwindcss/defaultTheme.js';

const hexToRgbChannels = (hex) => {
  const normalized = hex.replace('#', '');

  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16);
    const g = parseInt(normalized[1] + normalized[1], 16);
    const b = parseInt(normalized[2] + normalized[2], 16);
    return `${r} ${g} ${b}`;
  }

  const value = parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `${r} ${g} ${b}`;
};

const withOpacity = (hex) => {
  const channels = hexToRgbChannels(hex);
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(${channels})`;
    }

    return `rgb(${channels} / ${opacityValue})`;
  };
};

const createPalette = (entries) =>
  Object.fromEntries(Object.entries(entries).map(([key, value]) => [key, withOpacity(value)]));

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
        display: ['Space Grotesk', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.04em' }],
        'heading-xl': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'heading-lg': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        'heading-md': ['1.375rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.4', letterSpacing: '-0.005em' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'body-base': ['1rem', { lineHeight: '1.7' }],
        'body-sm': ['0.9375rem', { lineHeight: '1.6' }],
        'body-xs': ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],
      },
      colors: {
        brand: createPalette({
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        }),
        surface: createPalette({
          800: '#222b44',
          900: '#151c30',
          950: '#0c1221',
        }),
        accent: {
          cyan: withOpacity('#22d3ee'),
          purple: withOpacity('#a855f7'),
          pink: withOpacity('#ec4899'),
          orange: withOpacity('#fb923c'),
          lime: withOpacity('#a3e635'),
        },
        success: createPalette({
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        }),
        warning: createPalette({
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fbbf24',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
        }),
        danger: createPalette({
          100: '#fee2e2',
          200: '#fecaca',
          300: '#f87171',
          400: '#ef4444',
          500: '#dc2626',
          600: '#b91c1c',
        }),
        info: createPalette({
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        }),
      },
      boxShadow: {
        soft: '0 14px 48px rgba(10, 17, 33, 0.35)',
        brand: '0 18px 48px rgba(99, 102, 241, 0.35)',
        'brand-strong': '0 30px 70px rgba(129, 140, 248, 0.55)',
        'brand-glow': '0 24px 64px rgba(99, 102, 241, 0.45)',
        'brand-glow-strong': '0 34px 88px rgba(129, 140, 248, 0.55)',
        outline: '0 0 0 2px rgba(99, 102, 241, 0.35)',
      },
      borderRadius: {
        pill: '999px',
      },
      transitionTimingFunction: {
        snappy: 'cubic-bezier(0.16, 1, 0.3, 1)',
        soothing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      backgroundImage: {
        'mesh-radiant': 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.18) 0%, transparent 55%), radial-gradient(circle at 80% 0%, rgba(34, 211, 238, 0.16) 0%, transparent 60%), radial-gradient(circle at 5% 90%, rgba(236, 72, 153, 0.14) 0%, transparent 60%)',
      },
    },
  },
  plugins: [daisyui],
};
