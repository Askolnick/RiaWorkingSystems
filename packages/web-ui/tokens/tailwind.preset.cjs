const plugin = require('tailwindcss/plugin');
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        text: 'var(--text)',
        theme: 'var(--theme)',
        secondary: 'var(--secondary)',
        inactive: 'var(--inactive)',
        attention: 'var(--attention)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'var(--radius-sm)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        1: 'var(--shadow-1)',
        2: 'var(--shadow-2)',
        3: 'var(--shadow-3)',
      },
      transitionDuration: {
        100: 'var(--dur-100)',
        200: 'var(--dur-200)',
        300: 'var(--dur-300)',
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant('mode-dark', '&.mode-dark &, .mode-dark &');
    }),
  ],
};
