const fs = require('fs');

const indexCssPath = './src/index.css';
const tailwindConfigPath = './tailwind.config.js';

let indexCss = fs.readFileSync(indexCssPath, 'utf8');

const newRootCss = `:root {
  color-scheme: dark;

  --base-contrast: 255 255 255;
  --body-bg-base: 12 18 33;
  --mesh-opacity: 0.12;

  --brand-50: 238 242 255;
  --brand-100: 224 231 255;
  --brand-200: 199 210 254;
  --brand-300: 165 180 252;
  --brand-400: 129 140 248;
  --brand-500: 99 102 241;
  --brand-600: 79 70 229;
  --brand-700: 67 56 202;
  --brand-800: 55 48 163;
  --brand-900: 49 46 129;
  --brand-950: 30 27 75;

  --accent-cyan: 34 211 238;
  --accent-purple: 168 85 247;
  --accent-pink: 236 72 153;
  --accent-orange: 251 146 60;
  --accent-lime: 163 230 53;

  --neutral-50: 248 250 252;
  --neutral-100: 238 242 248;
  --neutral-200: 220 227 238;
  --neutral-300: 186 199 219;
  --neutral-400: 145 164 189;
  --neutral-500: 116 136 163;
  --neutral-600: 90 108 134;
  --neutral-700: 67 81 105;
  --neutral-800: 46 55 73;
  --neutral-900: 26 33 48;
  --neutral-950: 10 16 29;

  --surface-50: 243 245 251;
  --surface-100: 229 233 245;
  --surface-200: 204 213 232;
  --surface-300: 166 182 214;
  --surface-400: 131 147 186;
  --surface-500: 100 116 155;
  --surface-600: 76 90 125;
  --surface-700: 53 64 97;
  --surface-800: 34 43 68;
  --surface-900: 21 28 48;
  --surface-950: 12 18 33;

  --status-success: 34 197 94;
  --status-warning: 245 158 11;
  --status-danger: 239 68 68;
  --status-info: 59 130 246;

  --shadow-soft: 0 14px 48px rgba(10, 17, 33, 0.35);
  --shadow-brand: 0 18px 48px rgba(99, 102, 241, 0.35);
  --shadow-brand-strong: 0 30px 70px rgba(129, 140, 248, 0.55);

  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-2xl: 2rem;

  --motion-duration-fast: 150ms;
  --motion-duration-medium: 350ms;
  --motion-duration-slow: 700ms;

  --motion-ease-snappy: cubic-bezier(0.16, 1, 0.3, 1);
  --motion-ease-soothing: cubic-bezier(0.4, 0, 0.2, 1);
  --motion-ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}

:root[data-theme="light"] {
  color-scheme: light;
  
  --base-contrast: 0 0 0;
  --body-bg-base: 248 250 252;
  --mesh-opacity: 0.04;
  
  --neutral-50: 10 16 29;
  --neutral-100: 26 33 48;
  --neutral-200: 46 55 73;
  --neutral-300: 67 81 105;
  --neutral-400: 90 108 134;
  --neutral-500: 116 136 163;
  --neutral-600: 145 164 189;
  --neutral-700: 186 199 219;
  --neutral-800: 220 227 238;
  --neutral-900: 238 242 248;
  --neutral-950: 248 250 252;

  --surface-50: 12 18 33;
  --surface-100: 21 28 48;
  --surface-200: 34 43 68;
  --surface-300: 53 64 97;
  --surface-400: 76 90 125;
  --surface-500: 100 116 155;
  --surface-600: 204 213 232;
  --surface-700: 220 227 238;
  --surface-800: 237 241 247;
  --surface-900: 248 250 252;
  --surface-950: 255 255 255;

  --shadow-soft: 0 10px 40px rgba(0, 0, 0, 0.05);
  --shadow-brand: 0 14px 40px rgba(99, 102, 241, 0.2);
  --shadow-brand-strong: 0 20px 60px rgba(129, 140, 248, 0.35);
}`;

// Replace everything from `:root {` down to `}` before `@layer base`
indexCss = indexCss.replace(/:root\s*\{[\s\S]*?\}(?=\s*@layer base)/, newRootCss);

// Replace body background
const oldBodyBg = `background-image:
      radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.12) 0%, transparent 45%),
      radial-gradient(circle at 80% 0%, rgba(34, 211, 238, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.08) 0%, transparent 50%),
      linear-gradient(180deg, rgba(12, 18, 33, 0.92) 0%, rgba(12, 18, 33, 0.98) 60%, rgba(12, 18, 33, 1) 100%);`;

const newBodyBg = `background-image:
      radial-gradient(circle at 10% 20%, rgba(99, 102, 241, var(--mesh-opacity)) 0%, transparent 45%),
      radial-gradient(circle at 80% 0%, rgba(34, 211, 238, calc(var(--mesh-opacity) * 0.8)) 0%, transparent 50%),
      radial-gradient(circle at 20% 80%, rgba(236, 72, 153, calc(var(--mesh-opacity) * 0.6)) 0%, transparent 50%),
      linear-gradient(180deg, rgba(var(--body-bg-base), 0.92) 0%, rgba(var(--body-bg-base), 0.98) 60%, rgba(var(--body-bg-base), 1) 100%);`;

indexCss = indexCss.replace(oldBodyBg, newBodyBg);

// Add contrast-color to theme
indexCss = indexCss.replace('html {', 'html {\\n    --tw-contrast: var(--base-contrast);');

// Replace selection and focus to use rgb variables
indexCss = indexCss.replace('background: rgba(99, 102, 241, 0.45);', 'background: rgba(var(--brand-500), 0.45);');
indexCss = indexCss.replace('outline: 2px solid rgba(99, 102, 241, 0.65);', 'outline: 2px solid rgba(var(--brand-500), 0.65);');

// Replace scrollbar styles
indexCss = indexCss.replace(/rgba\(12, 18, 33, [/.\d]+\)/g, 'rgba(var(--body-bg-base), 0.85)');
indexCss = indexCss.replace(/rgba\(99, 102, 241, [/.\d]+\)/g, 'rgba(var(--brand-500), 0.48)');
indexCss = indexCss.replace(/rgba\(129, 140, 248, [/.\d]+\)/g, 'rgba(var(--brand-400), 0.72)');
indexCss = indexCss.replace(/rgba\(255, 255, 255, [/.\d]+\)/g, 'rgba(var(--base-contrast), 0.15)');


fs.writeFileSync(indexCssPath, indexCss);


// Now generate tailwind.config.js
let tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf8');

const tbrand = Object.fromEntries([50,100,200,300,400,500,600,700,800,900,950].map(n => [n, \`rgb(var(--brand-\${n}) / <alpha-value>)\`]));
const tneutral = Object.fromEntries([50,100,200,300,400,500,600,700,800,900,950].map(n => [n, \`rgb(var(--neutral-\${n}) / <alpha-value>)\`]));
const tsurface = Object.fromEntries([50,100,200,300,400,500,600,700,800,900,950].map(n => [n, \`rgb(var(--surface-\${n}) / <alpha-value>)\`]));
const taccent = {
  cyan: 'rgb(var(--accent-cyan) / <alpha-value>)',
  purple: 'rgb(var(--accent-purple) / <alpha-value>)',
  pink: 'rgb(var(--accent-pink) / <alpha-value>)',
  orange: 'rgb(var(--accent-orange) / <alpha-value>)',
  lime: 'rgb(var(--accent-lime) / <alpha-value>)',
};

const newBrandStr = \`const brand = \${JSON.stringify(tbrand, null, 2).replace(/"([^"]+)":/g, '$1:')};\`;
const newNeutralStr = \`const neutral = \${JSON.stringify(tneutral, null, 2).replace(/"([^"]+)":/g, '$1:')};\`;
const newAccentStr = \`const accent = \${JSON.stringify(taccent, null, 2).replace(/"([^"]+)":/g, '$1:')};\`;

tailwindConfig = tailwindConfig.replace(/const brand = \{[\s\S]*?\};/, newBrandStr);
tailwindConfig = tailwindConfig.replace(/const neutral = \{[\s\S]*?\};/, newNeutralStr);
tailwindConfig = tailwindConfig.replace(/const accent = \{[\s\S]*?\};/, newAccentStr);

const surfaceStrReplacer = \`surface: {
          50: 'rgb(var(--surface-50) / <alpha-value>)',
          100: 'rgb(var(--surface-100) / <alpha-value>)',
          200: 'rgb(var(--surface-200) / <alpha-value>)',
          300: 'rgb(var(--surface-300) / <alpha-value>)',
          400: 'rgb(var(--surface-400) / <alpha-value>)',
          500: 'rgb(var(--surface-500) / <alpha-value>)',
          600: 'rgb(var(--surface-600) / <alpha-value>)',
          700: 'rgb(var(--surface-700) / <alpha-value>)',
          800: 'rgb(var(--surface-800) / <alpha-value>)',
          900: 'rgb(var(--surface-900) / <alpha-value>)',
          950: 'rgb(var(--surface-950) / <alpha-value>)',
        },\`;

tailwindConfig = tailwindConfig.replace(/surface: \{[\s\S]*?950: '#0c1221',\s*\},/, surfaceStrReplacer);

// Add custom named colors contrast-base
tailwindConfig = tailwindConfig.replace('colors: {', "colors: {\\n        'contrast-base': 'rgb(var(--base-contrast) / <alpha-value>)',");

fs.writeFileSync(tailwindConfigPath, tailwindConfig);
console.log('Successfully updated index.css and tailwind.config.js');
