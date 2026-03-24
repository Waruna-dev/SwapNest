/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface-container-high": "#eae8e4",
        "on-tertiary": "#ffffff",
        "on-primary-fixed": "#002114",
        "on-primary-container": "#86af99",
        "surface-container-lowest": "#ffffff",
        "on-tertiary-container": "#4bb7a8",
        "tertiary-fixed": "#8cf5e4",
        "surface-variant": "#e4e2de",
        "secondary-fixed": "#ffdbcf",
        "on-surface-variant": "#414844",
        "inverse-on-surface": "#f2f0ed",
        "on-surface": "#1b1c1a",
        "secondary-container": "#fe7e4f",
        "surface-bright": "#fbf9f5",
        "on-secondary-fixed": "#380c00",
        "on-error-container": "#93000a",
        "on-secondary-fixed-variant": "#822800",
        "surface-tint": "#3f6653",
        "tertiary-fixed-dim": "#6fd8c8",
        "error": "#ba1a1a",
        "primary-fixed-dim": "#a5d0b9",
        "primary-fixed": "#c1ecd4",
        "on-tertiary-fixed-variant": "#005048",
        "on-primary-fixed-variant": "#274e3d",
        "inverse-primary": "#a5d0b9",
        "surface-container-highest": "#e4e2de",
        "outline-variant": "#c1c8c2",
        "error-container": "#ffdad6",
        "surface-container-low": "#f5f3ef",
        "primary": "#012d1d",
        "surface-container": "#efeeea",
        "outline": "#717973",
        "primary-container": "#1b4332",
        "on-secondary-container": "#6b1f00",
        "tertiary-container": "#00443d",
        "on-error": "#ffffff",
        "secondary": "#a43c12",
        "on-primary": "#ffffff",
        "on-tertiary-fixed": "#00201c",
        "secondary-fixed-dim": "#ffb59c",
        "on-secondary": "#ffffff",
        "surface-dim": "#dbdad6",
        "background": "#fbf9f5",
        "surface": "#fbf9f5",
        "inverse-surface": "#30312e",
        "tertiary": "#002c27",
        "on-background": "#1b1c1a"
      },
      fontFamily: {
        "headline": ["Plus Jakarta Sans", "sans-serif"],
        "body": ["Manrope", "sans-serif"],
      },
      // 👇 THIS IS THE ONLY THING ADDED! 👇
      borderRadius: {
        "DEFAULT": "1rem", 
        "lg": "2rem", 
        "xl": "3rem", 
        "full": "9999px"
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