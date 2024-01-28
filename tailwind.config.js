/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          '100': '#06d6a0',
        },
        pink: {
          '100': '#ef476f',
        },
        blue: {
          '100': '#26547c',
        },
        yellow: {
          '100': '#ffd166',
        },
        bground: {
          '100': '#f6fbfa',
        },
        teama: {
          '100': '#4c527c',
          '200': '#e16cab',
          '300': '#6bc3c0',
        },
        teamb: {
          '100': '#2f7393',
          '200': '#a5d1ea',
          '300': '#e0c2ea',
        },
        /*
        Consistency: Use your primary color for main elements like headers and buttons.
        Highlighting: Use accent colors for calls to action, links, or to highlight important information.
        Readability: Ensure good contrast, especially with text. Use background colors that are easy on the eyes.
        */
    },
  },
},
animation: {
  'flash': 'flash 1s infinite', // Define the custom flash animation
},
keyframes: {
  flash: {
    '0%, 100%': { color: '#ffd166' }, // Yellow color
    '50%': { color: '#ef476f' },      // Pink color
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
