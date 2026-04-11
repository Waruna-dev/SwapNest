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
      fontFamily: {
        "headline": ["Plus Jakarta Sans", "sans-serif"],
        "body": ["Manrope", "sans-serif"],
      },
      borderRadius: {
        'lg': '0.75rem',
        'md': '0.5rem',
        'sm': '0.25rem',
        'xl': '1rem',
      },
      keyframes: {
        'fade-in-up': {
            '0%': { opacity: '0', transform: 'translateY(20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'fade-in': 'fade-in 1s ease-out forwards',
      }
    },
  },
  plugins: [],
}
