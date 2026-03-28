/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: { DEFAULT: '#0A0E1A', card: '#111827', lighter: '#1F2937' },
        brand: { DEFAULT: '#00C853', light: '#00E676', dark: '#00A650' },
      },
    },
  },
  plugins: [],
}
