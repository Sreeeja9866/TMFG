/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2d5016',
        secondary: '#6b8e23',
        accent: '#8fbc8f',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
