/** @type {import('tailwindcss').Config} */
// tailwind.config.js
//Color palette and fonts 
export default {
  content: ["./index.html", "./src/**/*.{js,ts,html}"],
  theme: {
    extend: {
      colors: {
        primary: "#E50914",
        secondary: "#121212",
      },
      fontFamily: {
        title: ["Bebas Neue", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
