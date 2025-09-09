module.exports = {
  presets: [require('../../packages/web-ui/tokens/tailwind.preset.cjs')],
  content: ['./app/**/*.{ts,tsx}', '../../packages/web-ui/src/**/*.{ts,tsx}'],
};
