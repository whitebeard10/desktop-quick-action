/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './core/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        win: {
          bg: 'rgba(15, 23, 42, 0.75)',
          border: 'rgba(255, 255, 255, 0.12)',
          accent: '#0078d4',
          accentHover: '#106ebe',
          card: 'rgba(30, 41, 59, 0.7)',
        },
      },
      backdropBlur: {
        xs: '2px',
        acrylic: '20px',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.7)' },
        },
      },
      boxShadow: {
        acrylic: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        glow: '0 0 25px rgba(59, 130, 246, 0.4)',
      },
    },
  },
  plugins: [],
};
