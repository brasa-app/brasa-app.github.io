import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { StoreProvider } from '@/lib/store';
import { useTheme } from '@/lib/theme';

export default function RootLayout() {
  const scheme = useColorScheme();
  const t = useTheme();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return (
    <StoreProvider>
      <ThemeProvider value={{ ...base, colors: { ...base.colors, background: t.bg, card: t.surface, primary: t.ember, text: t.ink, border: t.line } }}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerTintColor: t.ink }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="listing/[id]" options={{ title: 'Anuncio', presentation: 'modal' }} />
          <Stack.Screen name="filters" options={{ title: 'Filtros', presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </StoreProvider>
  );
}
