/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maybank: {
          yellow: '#FFC800',
          yellowHover: '#E5B400',
          yellowLight: '#FFF8E1',
          dark: '#0E1013',
          darkSurface: '#14161B',
          darkCard: '#1A1D24',
          darkBorder: '#272B35'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
