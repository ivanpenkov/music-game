/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          950: '#090d16',
          900: '#0f172a',
          850: '#151e36',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          accent: '#6366f1', // Indigo accent
          neon: '#06b6d4',   // Cyan glow
          emerald: '#10b981',// Correct green
          rose: '#f43f5e',   // Incorrect red
          amber: '#f59e0b'   // Warning/hint amber
        }
      },
      boxShadow: {
        'glow-accent': '0 0 25px -3px rgba(99, 102, 241, 0.45)',
        'glow-emerald': '0 0 25px -3px rgba(16, 185, 129, 0.5)',
        'glow-rose': '0 0 25px -3px rgba(244, 63, 94, 0.5)',
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.45)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.03)' },
        },
        waveform: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '32px' },
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'wave': 'waveform 1s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}

