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
        cyber: {
          950: '#070a10',
          900: '#0a0d14',
          850: '#0e1320',
          800: '#141b2d',
          750: '#192238',
          700: '#1e2942',
          600: '#2b3a5c',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(6, 182, 212, 0.25)',
        'glow-cyan-lg': '0 0 25px rgba(6, 182, 212, 0.4)',
        'glow-violet': '0 0 15px rgba(139, 92, 246, 0.25)',
        'glow-emerald': '0 0 15px rgba(16, 185, 129, 0.25)',
        'glow-rose': '0 0 15px rgba(244, 63, 94, 0.25)',
        'glow-orb': '0 0 40px rgba(6, 182, 212, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sound-wave': 'soundWave 1.2s ease-in-out infinite alternate',
        'spin-slow': 'spin 12s linear infinite',
        'spin-reverse-slow': 'spinReverse 16s linear infinite',
        'orb-breathe': 'orbBreathe 4s ease-in-out infinite alternate',
      },
      keyframes: {
        soundWave: {
          '0%': { height: '4px' },
          '100%': { height: '24px' },
        },
        spinReverse: {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        orbBreathe: {
          '0%': { transform: 'scale(0.96)', opacity: '0.85' },
          '100%': { transform: 'scale(1.04)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
