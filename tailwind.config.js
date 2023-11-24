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
          '300': '#b7ec2f',
          '400': '#99d210',
          '500': '#76a808',
        },
        blue: {
          '100': '#85c5f4',
          '200': '#4aabed',
          '300': '#1b8ddc',
          '400': '#0e6fbb',
          '500': '#0d5997',
        },
    },
  },
},
screens: {
  'sm': '640px',
  // => @media (min-width: 640px) { ... }

  'md': '768px',
  // => @media (min-width: 768px) { ... }

  'lg': '1024px',
  // => @media (min-width: 1024px) { ... }

  'xl': '1280px',
  // => @media (min-width: 1280px) { ... }

  '2xl': '1536px',
  // => @media (min-width: 1536px) { ... }
},
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
