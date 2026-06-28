/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx}', './src/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Arial'],
        cairo: ['Arial'],
      },
      colors: {
        brand: '#179B7D',
        'brand-dark': '#075247',
        surface: '#F7F8F6',
        ink: '#1E252B',
        muted: '#7B858F',
      },
    },
  },
  plugins: [],
};
