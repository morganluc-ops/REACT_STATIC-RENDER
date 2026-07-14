import { createStitches } from '@stitches/react';

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config,
} = createStitches({
  theme: {
    colors: {
      primary: '#087ea4', // React docs blue
      bg: '#ffffff',
      text: '#23272f',
      sidebarBg: '#f6f7f9',
      border: '#ebecf0',
      codeBg: '#f6f7f9',
    },
    space: {
      1: '4px',
      2: '8px',
      3: '16px',
      4: '24px',
      5: '32px',
      6: '64px',
    },
    fonts: {
      body: 'system-ui, -apple-system, sans-serif',
      code: 'ui-monospace, SFMono-Regular, Consolas, monospace',
    },
  },
});

export const globalStyles = globalCss({
  '*': { margin: 0, padding: 0, boxSizing: 'border-box' },
  body: {
    fontFamily: '$body',
    backgroundColor: '$bg',
    color: '$text',
    lineHeight: 1.6,
  },
  a: {
    color: '$primary',
    textDecoration: 'none',
  },
});
