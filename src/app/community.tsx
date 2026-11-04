import { router } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';

import { Box, Button, Sub, Title } from '@/components/ui';
import { CATEGORIES, PLATFORMS, euros } from '@/lib/platforms';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';
import type { CommunityDeal } from '@/lib/types';

/** Temperatura del chollo: votos netos, con menos peso cuanto más antiguo. */
const temperature = (d: CommunityDeal) => Math.round((d.hot - d.cold) / Math.pow(1 + (Date.now() - d.createdAt) / 3_600_000, 0.4));

export default function Community() {
  const t = useTheme();
  const { deals, vote } = useStore();
  const sorted = [...deals].sort((a, b) => temperature(b) - temperature(a));

  return (
    <FlatList
      data={sorted}
      keyExtractor={(d) => d.id}
      contentContainerStyle={{ padding: 16, gap: 10, maxWidth: 720, width: '100%', alignSelf: 'center' }}
      ListHeaderComponent={
        <View style={{ gap: 10, marginBottom: 4 }}>
          <Title>Chollos de la comunidad</Title>
          <Sub>Los usuarios comparten chollos de cualquier web y todos votan. Los más votados aparecen primero.</Sub>
          <Button label="＋ Compartir un chollo" onPress={() => router.push('/share-deal')} />
        </View>
      }
      renderItem={({ item: d }) => {
        const temp = temperature(d);
        const hotColor = temp >= 50 ? t.ember : temp >= 0 ? t.warn : t.night;
        const minutes = Math.round((Date.now() - d.createdAt) / 60000);
        return (
          <Box style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={{ alignItems: 'center', gap: 4, width: 56 }}>
              <Pressable onPress={() => vote(d.id, 'hot')} accessibilityLabel="Votar caliente"
                style={{ padding: 4, borderRadius: 8, backgroundColor: d.myVote === 'hot' ? t.emberSoft : 'transparent' }}>
                <Text style={{ fontSize: 20 }}>🔥</Text>
              </Pressable>
              <Text style={{ color: hotColor, fontWeight: '800', fontSize: 16 }}>{temp}°</Text>
              <Pressable onPress={() => vote(d.id, 'cold')} accessibilityLabel="Votar frío"
                style={{ padding: 4, borderRadius: 8, backgroundColor: d.myVote === 'cold' ? t.surface2 : 'transparent' }}>
                <Text style={{ fontSize: 20 }}>❄️</Text>
              </Pressable>
            </View>
            <View style={{ flex: 1, gap: 4, minWidth: 0 }}>
              <Text style={{ color: t.ink, fontWeight: '700' }} numberOfLines={2}>
                {CATEGORIES[d.category].emoji} {d.title}
              </Text>
              <Text style={{ color: t.ink, fontSize: 20, fontWeight: '800' }}>{euros(d.price)}</Text>
              <Sub>
                {PLATFORMS[d.platform].name} · por {d.author} · hace {minutes < 60 ? `${minutes} min` : `${Math.round(minutes / 60)} h`}
                {d.example ? ' · ejemplo' : ''}
              </Sub>
              <Button label={`Ver en ${PLATFORMS[d.platform].name}`} variant="ghost" href={d.url} style={{ paddingVertical: 8, alignSelf: 'flex-start' }} />
            </View>
          </Box>
        );
      }}
    />
  );
}
