/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#fedd03",
        dark: "#00000",
        mid: "#4A4A4A",
        lightBg: "#F6F6F6",
        accent: "#00A6ED",
      },
      fontFamily: {
        sans: ['Circular Std', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
