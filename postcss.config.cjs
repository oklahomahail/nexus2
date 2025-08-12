// postcss.config.cjs - Fixed for Tailwind CSS 4.x (CommonJS)
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
module.exports = {
  plugins: [require('@tailwindcss/postcss')],
};
