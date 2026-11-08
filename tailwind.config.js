/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        surface: {
          DEFAULT: '#111827',
          card: '#131B2E',
          hover: '#1B253D',
          border: '#1F2E4D',
          muted: '#2A3B5F',
        },
        brand: {
          teal: '#0D9488',
          cyan: '#06B6D4',
          accent: '#14B8A6',
          glow: 'rgba(20, 184, 166, 0.15)',
        },
        status: {
          needsReview: '#F59E0B',
          serious: '#EF4444',
          resolved: '#10B981',
          processing: '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

