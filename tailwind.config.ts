import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        assa: {
          // Legacy aliases (kept for backward compat)
          bg: '#0d1410',
          green: '#00e676',
          'green-dark': '#00c853',
          card: 'rgba(255,255,255,0.04)',
          'card-border': 'rgba(255,255,255,0.08)',
          teal: '#00e5ff',
          gray: 'rgba(255,255,255,0.06)',
          'gray-light': 'rgba(255,255,255,0.4)',
          // Surface hierarchy (Nocturnal Alchemist, green-tinted)
          surface:          '#0d1410',
          'surface-low':    '#141a14',
          'surface-mid':    '#1b221b',
          'surface-high':   '#252e25',
          'surface-highest':'#303930',
          'surface-bright': '#3a443a',
          // Primary
          primary:          '#00e676',
          'primary-dim':    '#00c853',
          'primary-container': 'rgba(0,230,118,0.18)',
          'on-primary':     '#002d14',
          // Text
          'on-surface':     '#d8e8d8',
          'on-surface-var': '#a8c0a8',
          outline:          '#506850',
          'outline-var':    '#253025',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        glass: '20px',
        xs: '4px',
      },
    },
  },
  plugins: [],
};
export default config;
