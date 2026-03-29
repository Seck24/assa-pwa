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
          bg: '#060F08',
          green: '#00A650',
          'green-dark': '#008A42',
          card: '#1A0A0A',
          'card-border': '#3D1A1A',
          teal: '#00B4B4',
          gray: '#2A2A2A',
          'gray-light': '#888888',
        },
      },
    },
  },
  plugins: [],
};
export default config;
