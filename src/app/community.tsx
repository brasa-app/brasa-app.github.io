import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';

import { Box, Button, Sub, Title } from '@/components/ui';
import { CATEGORIES, PLATFORMS, euros } from '@/lib/platforms';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';
import { temperature } from '@/lib/community';


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
                <Ionicons name="arrow-up" size={20} color={t.ember} />
              </Pressable>
              <Text style={{ color: hotColor, fontWeight: '800', fontSize: 16 }}>{temp}°</Text>
              <Pressable onPress={() => vote(d.id, 'cold')} accessibilityLabel="Votar frío"
                style={{ padding: 4, borderRadius: 8, backgroundColor: d.myVote === 'cold' ? t.surface2 : 'transparent' }}>
                <Ionicons name="arrow-down" size={20} color={t.muted} />
              </Pressable>
            </View>
            <View style={{ width: 76, height: 76, borderRadius: 10, backgroundColor: t.surface2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {d.imageUrl ? <Image source={d.imageUrl} style={{ width: 76, height: 76 }} contentFit="cover" /> : <Ionicons name={CATEGORIES[d.category].icon as never} size={28} color={t.muted} />}
            </View>
            <View style={{ flex: 1, gap: 4, minWidth: 0 }}>
              <Text style={{ color: t.ink, fontWeight: '700' }} numberOfLines={2}>
                {d.title}
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
