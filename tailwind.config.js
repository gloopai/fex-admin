/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        antd: {
          primary: '#1677ff',
          'primary-hover': '#4096ff',
          'primary-active': '#0958d9',
          'bg-layout': '#f5f5f5',
          'bg-container': '#ffffff',
          'sidebar-dark': '#001529',
          'sidebar-dark-item': '#001529',
          'sidebar-dark-item-active': '#1677ff',
          'sidebar-light': '#ffffff'
        },
        brand: {
          50: '#eef7ff',
          100: '#daeefe',
          200: '#bfe2fe',
          300: '#93d1fd',
          400: '#60b7fa',
          500: '#3b98f6',
          600: '#287be9',
          700: '#2163d5',
          800: '#2250ad',
          900: '#214789'
        }
      },
      boxShadow: {
        panel: '0 8px 30px -14px rgba(15, 23, 42, 0.28)'
      }
    }
  },
  plugins: []
}
