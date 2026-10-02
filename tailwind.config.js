/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#C5221F',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7f1d1d',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8FAFC',
          card: '#FFFFFF',
        },
        ink: {
          primary: '#0F172A',
          secondary: '#1E293B',
          muted: '#64748B',
          subtle: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'float': '0 8px 30px rgba(0, 0, 0, 0.08)',
        'sticky': '0 -4px 20px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
