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

const v = (name) => `rgb(var(${name}) / <alpha-value>)`;

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
        // Theme-aware tokens (switch via [data-theme] CSS variables)
        white: v('--c-white'),
        glass: v('--c-glass'),
        neutral: {
          50: v('--c-neutral-50'),
          100: v('--c-neutral-100'),
          200: v('--c-neutral-200'),
          300: v('--c-neutral-300'),
          400: v('--c-neutral-400'),
          500: v('--c-neutral-500'),
          600: v('--c-neutral-600'),
          700: v('--c-neutral-700'),
          800: v('--c-neutral-800'),
          900: v('--c-neutral-900'),
          950: v('--c-neutral-950'),
        },
        surface: {
          800: v('--c-surface-800'),
          900: v('--c-surface-900'),
          950: v('--c-surface-950'),
        },
        brand: createPalette({
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#8B95FF',
          500: '#6E7BFF',
          600: '#5A66F0',
          700: '#4B54D6',
          800: '#3B43AE',
          900: '#2E3387',
          950: '#1e1b4b',
        }),
        accent: {
          cyan: withOpacity('#4DD8FF'),
          purple: withOpacity('#7B5DFF'),
          pink: withOpacity('#ec4899'),
          orange: withOpacity('#fb923c'),
          lime: withOpacity('#a3e635'),
        },
        success: createPalette({
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#2ECC71',
          600: '#1faa5a',
          700: '#178a49',
        }),
        warning: createPalette({
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fbbf24',
          400: '#F5B041',
          500: '#d98e2b',
          600: '#b45309',
        }),
        danger: createPalette({
          100: '#fee2e2',
          200: '#fecaca',
          300: '#f87171',
          400: '#ff8797',
          500: '#FF5D73',
          600: '#e23a55',
        }),
        info: createPalette({
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#6E7BFF',
          500: '#5A66F0',
          600: '#4B54D6',
        }),
        ink: v('--c-ink'),
        muted: v('--c-muted'),
        faint: v('--c-faint'),
        'on-accent': v('--c-on-accent'),
        canvas: v('--c-canvas'),
        hairline: 'var(--c-hairline)',
        'hairline-soft': 'var(--c-hairline-soft)',
        tint: 'var(--c-fill)',
        'tint-strong': 'var(--c-fill-strong)',
      },
      boxShadow: {
        soft: '0 14px 48px rgba(2, 4, 10, 0.40)',
        brand: '0 18px 48px rgba(110, 123, 255, 0.30)',
        'brand-strong': '0 30px 70px rgba(123, 93, 255, 0.45)',
        'brand-glow': '0 24px 64px rgba(110, 123, 255, 0.45)',
        'brand-glow-strong': '0 34px 88px rgba(123, 93, 255, 0.55)',
        outline: '0 0 0 2px rgba(110, 123, 255, 0.35)',
        glass: '0 20px 50px rgba(2, 4, 10, 0.45)',
        'glass-lg': '0 30px 80px rgba(2, 4, 10, 0.55)',
        'inner-hi': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
      },
      borderRadius: {
        pill: '999px',
        control: '1rem',
        card: '1.5rem',
        xl2: '1.75rem',
      },
      transitionTimingFunction: {
        snappy: 'cubic-bezier(0.16, 1, 0.3, 1)',
        soothing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      backgroundImage: {
        'mesh-radiant': 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.18) 0%, transparent 55%), radial-gradient(circle at 80% 0%, rgba(34, 211, 238, 0.16) 0%, transparent 60%), radial-gradient(circle at 5% 90%, rgba(236, 72, 153, 0.14) 0%, transparent 60%)',
      },
      keyframes: {
        aurora: {
          '0%': { transform: 'translate3d(-6%, -4%, 0) rotate(0deg) scale(1.05)' },
          '50%': { transform: 'translate3d(6%, 4%, 0) rotate(8deg) scale(1.15)' },
          '100%': { transform: 'translate3d(-6%, -4%, 0) rotate(0deg) scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        aurora: 'aurora 22s ease-in-out infinite',
        shimmer: 'shimmer 2.4s infinite linear',
      },
    },
  },
  plugins: [],
};
