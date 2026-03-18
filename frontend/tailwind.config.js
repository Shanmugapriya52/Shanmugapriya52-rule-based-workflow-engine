/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lilac: {
          primary: '#C8A2FF',
          secondary: '#E6D6FF',
          bg: '#F7F3FF',
          card: '#FFFFFF',
          accent: '#A77BFF',
          text: '#3A2E4F',
          muted: '#8B7B9F', // Adding a muted text color for placeholder/secondary
          border: '#E6D6FF'  // Reusing secondary for softer borders
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        }
      }
    },
  },
  plugins: [],
}
