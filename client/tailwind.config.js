/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./client/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        terracotta: {
          DEFAULT: '#B8400E',
          hover: '#9E350B',
          light: '#F5E6E0'
        },
        teal: {
          DEFAULT: '#1F7A6B',
          hover: '#186256',
          light: '#E3F2EF'
        },
        cream: {
          DEFAULT: '#FAF1E4',
          light: '#FFFDF9',
          dark: '#EFE3D0'
        },
        darkbrown: {
          DEFAULT: '#2B1B10',
          hover: '#3D2717',
          light: '#4A3423'
        },
        softYellow: {
          DEFAULT: '#F4D79A',
          hover: '#E8C67C',
          light: '#FDF7EB'
        }
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', '-apple-system', 'sans-serif']
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem'
      }
    }
  },
  plugins: []
};
