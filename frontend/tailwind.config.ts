import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0b0f0d',
        surface: '#141a17',
        primary: '#3fae5a',
      },
    },
  },
  plugins: [],
};

export default config;
