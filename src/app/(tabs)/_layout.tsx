import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import { Pressable, View, type ColorValue } from 'react-native';

import { BrasaLogo } from '@/components/brasa-logo';
import { useTheme } from '@/lib/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const icon =
  (on: IconName, off: IconName) =>
  ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? on : off} color={color as string} size={size} />
  );

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: t.ember,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: { backgroundColor: t.surface, borderTopColor: t.line, height: 64, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: t.surface },
        headerShadowVisible: false,
        headerTitleStyle: { color: t.ink, fontWeight: '800', fontSize: 20 },
        headerTitleAlign: 'left',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ofertas TOP',
          headerTitle: () => <BrasaLogo />,
          headerRight: () => (
            <Pressable onPress={() => router.push('/favorites')} accessibilityLabel="Favoritos y alertas" style={{ paddingHorizontal: 16 }}>
              <Ionicons name="notifications-outline" size={24} color={t.ink} />
            </Pressable>
          ),
          tabBarIcon: icon('flame', 'flame-outline'),
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          title: 'Vender',
          headerTitle: 'Subir producto',
          tabBarIcon: () => (
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.ember, alignItems: 'center', justifyContent: 'center', marginTop: -4 }}>
              <Ionicons name="add" size={28} color={t.emberInk} />
            </View>
          ),
        }}
      />
      <Tabs.Screen name="search" options={{ title: 'Buscador', tabBarIcon: icon('search', 'search-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'Mi perfil', tabBarIcon: icon('person-circle', 'person-circle-outline') }} />
    </Tabs>
  );
}
