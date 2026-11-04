import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { ListingCard } from '@/components/listing-card';
import { SearchHeader } from '@/components/search-header';
import { Button, Sub, Title } from '@/components/ui';
import { temperature } from '@/lib/community';
import { CATEGORIES, PLATFORMS, euros } from '@/lib/platforms';
import { heatScore, isSafe, passesFilters } from '@/lib/scoring';
import { trendingAll } from '@/lib/sources';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';
import { defaultFilters, type Listing } from '@/lib/types';

/** Cada cuánto se refrescan las ofertas TOP. */
const REFRESH_MS = 60_000;

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function Shortcut({ icon, title, sub, onPress, color }: { icon: IconName; title: string; sub: string; onPress: () => void; color: string }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button"
      style={({ pressed }) => ({ flex: 1, padding: 12, borderRadius: 16, backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, gap: 6, opacity: pressed ? 0.85 : 1 })}>
      <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={20} color="#fff" />
      </View>
      <Text style={{ color: t.ink, fontWeight: '700', fontSize: 13.5 }} numberOfLines={1}>{title}</Text>
      <Text style={{ color: t.muted, fontSize: 11.5 }} numberOfLines={2}>{sub}</Text>
    </Pressable>
  );
}

export default function TopDeals() {
  const t = useTheme();
  const { filters, setFilters, deals: community, isHidden } = useStore();
  const [all, setAll] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(Date.now());
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async () => {
    setLoading(true);
    setAll(await trendingAll());
    setUpdatedAt(Date.now());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const r = setInterval(load, REFRESH_MS);
    const c = setInterval(() => setNow(Date.now()), 5000);
    return () => {
      clearInterval(r);
      clearInterval(c);
    };
  }, [load]);

  const visible = useMemo(() => all.filter((l) => passesFilters(l, filters) && !isHidden(l)), [all, filters, isHidden]);
  const deals = useMemo(() => visible.filter(isSafe).sort((a, b) => heatScore(b) - heatScore(a)), [visible]);
  const hidden = visible.length - deals.length;
  const hotCommunity = [...community].filter((d) => temperature(d) >= 20).sort((a, b) => temperature(b) - temperature(a)).slice(0, 5);
  const secs = Math.round((now - updatedAt) / 1000);

  return (
    <FlatList
      data={deals}
      keyExtractor={(l) => l.id}
      numColumns={2}
      columnWrapperStyle={{ gap: 12 }}
      contentContainerStyle={{ padding: 16, gap: 18, maxWidth: 760, width: '100%', alignSelf: 'center' }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={t.ember} />}
      ListHeaderComponent={
        <View style={{ gap: 18 }}>
          <SearchHeader />

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Shortcut icon="flame" color={t.ember} title="Comunidad" sub="Chollos votados" onPress={() => router.push('/community')} />
            <Shortcut icon="location" color="#2f7de1" title="Cerca de ti" sub="Compra en mano" onPress={() => router.push('/nearby')} />
            <Shortcut icon="shield-checkmark" color="#1f8a5b" title="¿Es fiable?" sub="Sube una captura" onPress={() => router.push('/check')} />
          </View>

          {hotCommunity.length > 0 && (
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Title size={18}>Lo más votado</Title>
                <Pressable onPress={() => router.push('/community')}><Text style={{ color: t.ember, fontWeight: '700' }}>Ver todo</Text></Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {hotCommunity.map((d) => (
                  <Pressable key={d.id} onPress={() => router.push('/community')}
                    style={{ width: 210, padding: 12, borderRadius: 16, backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, gap: 4 }}>
                    <Text style={{ color: t.ember, fontWeight: '800' }}>🔥 {temperature(d)}°</Text>
                    <Text style={{ color: t.ink, fontWeight: '600' }} numberOfLines={1}>{CATEGORIES[d.category].emoji} {d.title}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <Text style={{ color: t.ink, fontWeight: '800', fontSize: 17 }}>{euros(d.price)}</Text>
                      <Text style={{ color: t.muted, fontSize: 12 }}>{PLATFORMS[d.platform].name}</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title size={22}>Está que arde 🔥</Title>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: t.ok }} />
                <Text style={{ color: t.muted, fontSize: 12 }}>{secs < 10 ? 'Ahora mismo' : `Hace ${secs} s`}</Text>
              </View>
            </View>
            <Sub>
              Los chollos más virales de todas las webs, con vendedor comprobado.
              {hidden > 0 ? ` 🛡 ${hidden} ocultos por posible estafa.` : ''}
            </Sub>
          </View>
        </View>
      }
      ListEmptyComponent={
        loading ? null : (
          <View style={{ gap: 12, alignItems: 'center', padding: 24 }}>
            <Text style={{ fontSize: 40 }}>🔍</Text>
            <Text style={{ color: t.muted, textAlign: 'center' }}>No hay ofertas con estos filtros. Prueba a ampliar la distancia o el precio.</Text>
            <Button label="Quitar filtros" variant="ghost" onPress={() => setFilters(defaultFilters)} />
          </View>
        )
      }
      renderItem={({ item, index }) => (
        <View style={{ flex: 1, maxWidth: index === deals.length - 1 && deals.length % 2 ? '50%' : undefined }}>
          <ListingCard l={item} showHeat />
        </View>
      )}
    />
  );
}
