/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2D4A35",
        sage:    "#7A9E7E",
        accent:  "#C4622D",
        cream:   "#F5F0E8",
        "light-sage": "#E8F0E9",
        border:  "#D0C9BA",
      },
    },
  },
  plugins: [],
}
