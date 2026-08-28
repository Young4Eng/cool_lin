/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cool: {
          50: '#f0f7fc',
          100: '#e0eff9',
          200: '#b9dff3',
          300: '#7cc5eb',
          400: '#4aa8dc',
          500: '#1e88c7',
          600: '#126da7',
          700: '#105888',
          800: '#114a70',
          900: '#133e5e',
          950: '#0c273e',
        },
        win: {
          bg: '#1b2838',
          card: '#ffffff',
          border: '#d0dbe5',
          header: '#3b92cb',
          hover: '#e5f3fc',
          selected: '#cce8ff',
          text: '#222222',
          muted: '#666666',
        }
      },
      fontFamily: {
        sans: ['"Malgun Gothic"', '"맑은 고딕"', 'Apple SD Gothic Neo', 'Noto Sans KR', 'sans-serif'],
      },
      boxShadow: {
        'win': '0 8px 30px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12)',
        'win-active': '0 12px 40px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.15)',
        'widget': '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
