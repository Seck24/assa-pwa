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
          bg: '#0d1420',
          green: '#00e676',
          'green-dark': '#00c853',
          card: 'rgba(255,255,255,0.04)',
          'card-border': 'rgba(255,255,255,0.08)',
          teal: '#00e5ff',
          gray: 'rgba(255,255,255,0.06)',
          'gray-light': 'rgba(255,255,255,0.4)',
        },
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
};
export default config;
