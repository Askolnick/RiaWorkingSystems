import React, { useEffect } from 'react';
import '../tokens/ria.css';

// Configure global Storybook parameters. These control actions matching,
// control panel expansion, etc. Feel free to adjust as your use cases
// evolve. See https://storybook.js.org/docs/react/writing-stories/parameters
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: { expanded: true },
};

// Define globalTypes to add toolbar controls. Users can switch between
// light and dark modes and adjust the base hue of the theme. Changing
// theme hue updates the --theme-h CSS variable at runtime.
export const globalTypes = {
  mode: {
    name: 'Mode',
    description: 'Color mode',
    defaultValue: 'light',
    toolbar: {
      icon: 'circlehollow',
      items: [
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' },
      ],
    },
  },
  themeHue: {
    name: 'Theme Hue',
    description: 'Base hue for theme colours',
    defaultValue: 210,
    toolbar: {
      icon: 'paintbrush',
      items: Array.from({ length: 12 }, (_, i) => {
        const hue = i * 30;
        return { value: hue, title: String(hue) };
      }),
    },
  },
};

// Decorator to apply globals. It toggles dark mode class and sets the
// --theme-h CSS variable. The decorator runs whenever globals change.
const withGlobals = (Story: any, context: any) => {
  const { mode, themeHue } = context.globals;
  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('mode-dark');
    } else {
      root.classList.remove('mode-dark');
    }
    // Update the CSS variable controlling theme hue. The tokens file
    // reads --theme-h and recomputes theme/secondary/inactive colours.
    root.style.setProperty('--theme-h', String(themeHue));
  }, [mode, themeHue]);
  return <Story />;
};

export const decorators = [withGlobals];