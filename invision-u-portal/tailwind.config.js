/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "brand-lime": "#C5F231",
        "brand-lime-hover": "#B5E028",
        "brand-lime-soft": "#F4FBEA",
        "brand-lime-ink": "#172014",
        "brand-lime-dim": "#8FA62A",
      },
      boxShadow: {
        lime: "0 12px 40px -8px rgba(197, 242, 49, 0.42)",
        "lime-lg": "0 22px 55px -12px rgba(197, 242, 49, 0.38)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      transitionProperty: {
        theme: "background-color, border-color, color, fill, stroke",
      },
    },
  },
  plugins: [],
};
