/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          DEFAULT: '#00FF87',
          glow: '#00FF874D',
          hover: '#00E077',
          dark: '#052e16',
          emerald: '#10B981'
        },
        dark: {
          bg: '#080C14',
          card: '#111827',
          elevated: '#1A2234',
          border: '#243048',
          hover: '#1F293D',
          subtle: '#475569'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'neon-glow': '0 0 25px -5px rgba(0, 255, 135, 0.4)',
        'neon-sm': '0 0 10px rgba(0, 255, 135, 0.3)',
        'red-glow': '0 0 20px -5px rgba(239, 68, 68, 0.4)',
        'amber-glow': '0 0 20px -5px rgba(245, 158, 11, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shred': 'shred 2.5s ease-in-out forwards',
        'scan-line': 'scan 2s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        },
        shred: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '50%': { transform: 'translateY(50%) scaleY(0.7)', opacity: '0.8' },
          '100%': { transform: 'translateY(120%) scaleY(0)', opacity: '0' }
        }
      }
    },
  },
  plugins: [],
}
