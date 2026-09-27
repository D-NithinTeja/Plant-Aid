/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#012d1d',
          container: '#1b4332',
          light: '#2c694e',
          fixed: '#c1ecd4',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
          container: '#86af99',
        },
        secondary: {
          DEFAULT: '#2c694e',
          container: '#aeeecb',
          fixed: '#b1f0ce',
        },
        'on-secondary': {
          DEFAULT: '#ffffff',
          container: '#316e52',
        },
        surface: {
          DEFAULT: '#f9f9f7',
          dim: '#dadad8',
          bright: '#f9f9f7',
          container: {
            lowest: '#ffffff',
            low: '#f4f4f2',
            DEFAULT: '#eeeeec',
            high: '#e8e8e6',
            highest: '#e2e3e1',
          },
        },
        'on-surface': {
          DEFAULT: '#1a1c1b',
          variant: '#414844',
        },
        outline: {
          DEFAULT: '#717973',
          variant: '#c1c8c2',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': {
          DEFAULT: '#ffffff',
          container: '#93000a',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#012d1d',
        },
      },
      borderRadius: {
        'xs': '0.25rem',
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
