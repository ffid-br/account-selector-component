/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ffid: {
          50: '#eef4ff',
          100: '#d9e5ff',
          200: '#bbd2ff',
          300: '#8cb4ff',
          400: '#5689ff',
          500: '#2f5fff',
          600: '#1a3ff5',
          700: '#122ce1',
          800: '#1525b6',
          900: '#17258f',
          950: '#121957',
        },
      },
    },
  },
  plugins: [],
}
