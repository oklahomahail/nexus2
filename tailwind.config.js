/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
  theme: {
  extend: {
    colors: {
      brand: {
        primary: '#1D3557',
        secondary: '#457B9D',
        accent: '#E63946',
        muted: '#F1FAEE',
        dark: '#0C1A30',
      },
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      display: ['"Playfair Display"', 'serif'],
    },
    borderRadius: {
      xl: '1rem',
      '2xl': '1.5rem',
    },
    boxShadow: {
      soft: '0 4px 12px rgba(0,0,0,0.06)',
    },
  },
},
};
