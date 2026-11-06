import { useColorScheme } from 'react-native';

const light = {
  bg: '#ffffff',
  surface: '#ffffff',
  surface2: '#f3f1ee',
  ink: '#161412',
  muted: '#77706a',
  line: '#ebe7e2',
  ember: '#e04e1b',
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
  bg: '#121110',
  surface: '#121110',
  surface2: '#1f1d1b',
  ink: '#f4f1ed',
  muted: '#a19a93',
  line: '#2a2725',
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

export const radius = 12;

/** Tipografía de titulares y precios. En web cae a la fuente del sistema mientras carga. */
export const font = {
  display: 'BricolageGrotesque_700Bold',
  heavy: 'BricolageGrotesque_800ExtraBold',
  medium: 'BricolageGrotesque_600SemiBold',
};

export const tints = ['#f1eee9', '#eceae6', '#efebe4', '#ebe9e5', '#f0ece6', '#e9e8e4', '#eeeae4'];
