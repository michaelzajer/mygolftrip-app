/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          '100': '#68f64a',
          '200': '#d7f87b',
          '300': '#b9f419',
        },
        blue: {
          '100': '#1c96e8',
          '200': '#4aabed',
        },
    },
  },
},
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
