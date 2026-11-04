import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/tabs';
import type { ColorValue } from 'react-native';

import { BrasaLogo } from '@/components/brasa-logo';
import { useTheme } from '@/lib/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const icon = (name: IconName) => ({ color, size }: { color: ColorValue; size: number }) => (
  <Ionicons name={name} color={color as string} size={size} />
);

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: t.ember,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: { backgroundColor: t.surface, borderTopColor: t.line },
        headerStyle: { backgroundColor: t.surface },
        headerTitleStyle: { color: t.ink, fontWeight: '800' },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Ofertas TOP', headerTitle: () => <BrasaLogo />, tabBarIcon: icon('flame') }} />
      <Tabs.Screen name="sell" options={{ title: 'Añadir', headerTitle: 'Añadir producto', tabBarIcon: icon('add-circle') }} />
      <Tabs.Screen name="search" options={{ title: 'Buscador', tabBarIcon: icon('search') }} />
      <Tabs.Screen name="profile" options={{ title: 'Mi perfil', tabBarIcon: icon('person-circle-outline') }} />
    </Tabs>
  );
}
