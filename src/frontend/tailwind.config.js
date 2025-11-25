/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.{js,jsx,ts,tsx}",
    "./main.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
    "./utils/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paper & Ink Theme
        paper: {
          50: '#FDFBF7',
          100: '#F9F5F1', // Main background
          200: '#F2EBE5',
          300: '#E6DCD3',
          400: '#D4C5B9',
          500: '#BFAFA6',
        },
        ink: {
          50: '#F5F5F4',
          100: '#E7E5E4',
          200: '#D6D3D1',
          300: '#A8A29E',
          400: '#78716C',
          500: '#57534E',
          600: '#44403C',
          700: '#2C2825', // Main text
          800: '#1C1917',
          900: '#0C0A09',
        },
        taupe: {
          50: '#F7F6F5',
          100: '#EBE9E8',
          200: '#D8D4D2',
          300: '#BDB6B3',
          400: '#9E9490',
          500: '#8C7B75', // Primary accent
          600: '#70625D',
        },
        sand: {
          50: '#FDFCFB',
          100: '#F7F4F1',
          200: '#EBE5DF',
          300: '#DCD3CB',
          400: '#D4C5B9', // Secondary accent
          500: '#B0A093',
        },
        clay: {
          50: '#FCF7F5',
          100: '#F8EDE9',
          200: '#F0DCD5',
          300: '#E6B8A2', // Highlight
          400: '#D9967A',
          500: '#C47456',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Georgia"', 'serif'],
        sans: ['"Inter"', '"Helvetica"', 'system-ui', 'sans-serif'],
        hand: ['"Dancing Script"', '"Brush Script MT"', 'cursive'],
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 10px 40px rgba(0, 0, 0, 0.1)',
        'soft-xl': '0 20px 60px rgba(0, 0, 0, 0.12)',
        'inner-soft': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
