/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0A0E1A',
          card: '#111827',
          lighter: '#1F2937',
          border: 'rgba(255,255,255,0.08)',
        },
        brand: {
          DEFAULT: '#00C853',
          light: '#00E676',
          dark: '#00A650',
          glow: 'rgba(0,200,83,0.25)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
