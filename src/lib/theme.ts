import { useColorScheme } from 'react-native';

const light = {
  bg: '#f6f4f2',
  surface: '#ffffff',
  surface2: '#efebe7',
  ink: '#1d1a1f',
  muted: '#6c6570',
  line: '#e3ddd8',
  ember: '#e8501f',
  emberInk: '#ffffff',
  emberSoft: '#fde6dc',
  night: '#2b2140',
  ok: '#1f8a5b',
  okSoft: '#dcf2e6',
  warn: '#b97400',
  warnSoft: '#fbefd4',
  bad: '#c62f3b',
  badSoft: '#fadde0',
};

const dark: typeof light = {
  bg: '#141116',
  surface: '#1e1a21',
  surface2: '#29232d',
  ink: '#f3eef2',
  muted: '#a79fab',
  line: '#352e3a',
  ember: '#ff6a3a',
  emberInk: '#1a0d07',
  emberSoft: '#3b2118',
  night: '#d9cff0',
  ok: '#52c98d',
  okSoft: '#15322a',
  warn: '#e2a93b',
  warnSoft: '#352a12',
  bad: '#ff6b76',
  badSoft: '#3a1a1f',
};

export type Palette = typeof light;

export function useTheme(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

export const radius = 14;

export const tints = ['#fde6dc', '#e3ecfb', '#e6f4ea', '#f6e7fb', '#fff2cc', '#e2f3f5', '#f2e8df'];
