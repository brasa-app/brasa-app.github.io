import { BricolageGrotesque_600SemiBold, BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold, useFonts } from '@expo-google-fonts/bricolage-grotesque';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { StoreProvider } from '@/lib/store';
import { font, useTheme } from '@/lib/theme';

export default function RootLayout() {
  const scheme = useColorScheme();
  const t = useTheme();
  useFonts({ BricolageGrotesque_600SemiBold, BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold });
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return (
    <StoreProvider>
      <ThemeProvider value={{ ...base, colors: { ...base.colors, background: t.bg, card: t.surface, primary: t.ember, text: t.ink, border: t.line } }}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerTintColor: t.ink, headerShadowVisible: false, headerStyle: { backgroundColor: t.bg }, headerTitleStyle: { fontFamily: font.display, fontSize: 18 }, headerBackButtonDisplayMode: 'minimal' }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="listing/[id]" options={{ title: 'Anuncio', presentation: 'modal' }} />
          <Stack.Screen name="filters" options={{ title: 'Filtros', presentation: 'modal' }} />
          <Stack.Screen name="community" options={{ title: 'Comunidad' }} />
          <Stack.Screen name="share-deal" options={{ title: 'Compartir un chollo', presentation: 'modal' }} />
          <Stack.Screen name="check" options={{ title: 'Comprobar anuncio' }} />
          <Stack.Screen name="nearby" options={{ title: 'Cerca de ti' }} />
          <Stack.Screen name="legal" options={{ title: 'Privacidad y aviso legal' }} />
          <Stack.Screen name="favorites" options={{ title: 'Favoritos y alertas' }} />
          <Stack.Screen name="welcome" options={{ headerShown: false, presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </StoreProvider>
  );
}
