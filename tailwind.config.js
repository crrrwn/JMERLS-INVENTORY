/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette: #06141B, #11212D, #253745, #4A5C6A, #9BA8AB, #CCD0CF
        primary: {
          50: '#CCD0CF',
          100: '#b8bebd',
          200: '#9BA8AB',
          300: '#7a8a8e',
          400: '#5c6d76',
          500: '#4A5C6A',
          600: '#3d4d59',
          700: '#253745',
          800: '#11212D',
          900: '#06141B',
        },
        sidebar: '#11212D',
        card: '#ffffff',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
      },
      minHeight: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
}
