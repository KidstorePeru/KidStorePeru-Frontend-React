/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        heading: ['ReadexPro', 'sans-serif'],
        burbankBig: ['BurbankBig', 'sans-serif'],
        burbankMedium: ['BurbankSmallMedium', 'sans-serif'],
        burbankBold: ['BurbankSmallBold', 'sans-serif'],
        burbankBlack: ['BurbankSmallBlack', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
        readex: ['ReadexPro', 'sans-serif'],
      },
      colors: {
        brand: { DEFAULT: '#8B5CF6', light: '#A78BFA', dark: '#6D28D9' },
      },
    },
  },
  plugins: [],
};
