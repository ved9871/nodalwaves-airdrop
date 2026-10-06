import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

/* Brand tokens (same values as the landing page) */
export const C = {
  void: '#050507',
  hull: '#0E1014',
  line: '#20232A',
  line2: '#2C3038',
  crimson: '#CE0E2D',
  hot: '#FF2E4C',
  chrome: '#C6CDD6',
  chrome2: '#8F96A0',
  text: '#F4F5F7',
  body: '#A3AAB4',
  muted: '#6B727C',
};

export const FONT = {
  display: '"Big Shoulders Display", Impact, "Arial Narrow", sans-serif',
  body: 'Inter, system-ui, sans-serif',
  mono: '"JetBrains Mono", Consolas, monospace',
};

export const CHROME_GRADIENT = 'linear-gradient(180deg,#FFFFFF 0%,#D7DCE3 42%,#8D949E 58%,#E9ECF0 100%)';
export const CRIMSON_GRADIENT = 'linear-gradient(180deg,#FF5C74 0%,#E0122F 55%,#9E0A22 100%)';

/* Variable font files served from /public (no network needed while rendering) */
export const fontsReady = Promise.all([
  loadFont({ family: 'Big Shoulders Display', url: staticFile('fonts/big-shoulders-display.woff2'), weight: '100 900' }),
  loadFont({ family: 'Inter', url: staticFile('fonts/inter.woff2'), weight: '100 900' }),
  loadFont({ family: 'JetBrains Mono', url: staticFile('fonts/jetbrains-mono.woff2'), weight: '100 800' }),
]);
