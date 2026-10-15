/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      colors: {
        obsidian: {
          950: '#060809',
          900: '#080c0e',
          850: '#0b1012',
          800: '#0f1518',
          750: '#141d21',
          700: '#1b272c',
          600: '#25353c',
          500: '#344750',
        },
        mint: {
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#2ee59d',
          600: '#10b981',
          700: '#059669',
          800: '#047857',
          900: '#064e3b',
          950: '#022c22',
        }
      },
      boxShadow: {
        'glow-mint': '0 0 20px rgba(45, 212, 191, 0.35)',
        'glow-mint-lg': '0 0 35px rgba(45, 212, 191, 0.55)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.35)',
        'glow-emerald-lg': '0 0 35px rgba(16, 185, 129, 0.55)',
        'glow-card': '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glow-card-mint': '0 8px 30px rgba(16, 185, 129, 0.12), inset 0 1px 0 rgba(45, 212, 191, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sound-wave': 'soundWave 1.2s ease-in-out infinite alternate',
        'spin-slow': 'spin 14s linear infinite',
        'spin-reverse-slow': 'spinReverse 18s linear infinite',
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
