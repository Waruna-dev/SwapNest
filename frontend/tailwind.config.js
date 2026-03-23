/** @type {import('tailwindcss').Config} */
export default {
  // 1. Tell Tailwind to look inside your src folder for React components
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 2. Add your SwapNest custom colors!
      colors: {
        swap: {
          primary: '#2A9D8F',   /* Fresh Teal Mint */
          secondary: '#F4A261', /* Warm Sandy Beige */
          accent: '#E76F51',    /* Soft Coral */
          bg: '#FFFFFF',        /* Clean White */
          text: '#264653',      /* Dark Charcoal Blue */
          light: '#8D99AE',     /* Gray for secondary text */
        }
      }
    },
  },
  plugins: [],
}