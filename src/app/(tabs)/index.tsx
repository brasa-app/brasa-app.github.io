import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { ListingCard } from '@/components/listing-card';
import { SearchHeader } from '@/components/search-header';
import { Image } from 'expo-image';

import { Button, Section } from '@/components/ui';
import { temperature } from '@/lib/community';
import { CATEGORIES, PLATFORMS, euros } from '@/lib/platforms';
import { heatScore, isSafe, passesFilters } from '@/lib/scoring';
import { trendingAll } from '@/lib/sources';
import { useStore } from '@/lib/store';
import { font, useTheme } from '@/lib/theme';
import { defaultFilters, type Listing } from '@/lib/types';

/** Cada cuánto se refrescan las ofertas TOP. */
const REFRESH_MS = 60_000;

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function Shortcut({ icon, title, onPress }: { icon: IconName; title: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button"
      style={({ pressed }) => ({ flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 6, borderRadius: 12, borderWidth: 1, borderColor: t.line, opacity: pressed ? 0.7 : 1 })}>
      <Ionicons name={icon} size={20} color={t.ink} />
      <Text style={{ color: t.ink, fontWeight: '600', fontSize: 12.5 }} numberOfLines={1}>{title}</Text>
    </Pressable>
  );
}

export default function TopDeals() {
  const t = useTheme();
  const { filters, setFilters, deals: community, isHidden, loaded, onboarded } = useStore();

  useEffect(() => {
    if (loaded && !onboarded) router.push('/welcome');
  }, [loaded, onboarded]);
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
      contentContainerStyle={{ padding: 16, gap: 22, maxWidth: 760, width: '100%', alignSelf: 'center' }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={t.ember} />}
      ListHeaderComponent={
        <View style={{ gap: 18 }}>
          <SearchHeader />

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Shortcut icon="people-outline" title="Comunidad" onPress={() => router.push('/community')} />
            <Shortcut icon="navigate-outline" title="Cerca de ti" onPress={() => router.push('/nearby')} />
            <Shortcut icon="shield-checkmark-outline" title="¿Es fiable?" onPress={() => router.push('/check')} />
          </View>

          {hotCommunity.length > 0 && (
            <View style={{ gap: 12 }}>
              <Section kicker="Comunidad" title="Lo más votado" action="Ver todo" onAction={() => router.push('/community')} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {hotCommunity.map((d) => (
                  <Pressable key={d.id} onPress={() => router.push('/community')}
                    style={{ width: 240, flexDirection: 'row', gap: 10, alignItems: 'center', padding: 8, borderRadius: 12, backgroundColor: t.surface2 }}>
                    <View style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', backgroundColor: t.bg }}>
                      {d.imageUrl != null ? <Image source={d.imageUrl} style={{ width: 56, height: 56 }} contentFit="cover" /> : (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={CATEGORIES[d.category].icon as never} size={24} color={t.muted} /></View>
                      )}
                    </View>
                    <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
                      <Text style={{ color: t.ink, fontWeight: '600', fontSize: 13 }} numberOfLines={1}>{d.title}</Text>
                      <Text style={{ color: t.ink, fontFamily: font.heavy, fontWeight: '800', fontSize: 16 }}>{euros(d.price)}</Text>
                      <Text style={{ color: t.muted, fontSize: 11.5 }}>
                        <Text style={{ color: t.ember, fontWeight: '700' }}>{temperature(d)}°</Text> · {PLATFORMS[d.platform].name}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ gap: 6 }}>
            <Section kicker="Ofertas TOP" title="Lo que más se mueve hoy" />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.ok }} />
              <Text style={{ color: t.muted, fontSize: 12 }}>
                {secs < 10 ? 'Actualizado ahora' : `Actualizado hace ${secs} s`}
                {hidden > 0 ? ` · ${hidden} ocultos por posible estafa` : ''}
              </Text>
            </View>
          </View>
        </View>
      }
      ListEmptyComponent={
        loading ? null : (
          <View style={{ gap: 12, alignItems: 'center', padding: 24 }}>
            <Ionicons name="search-outline" size={36} color={t.muted} />
            <Text style={{ color: t.muted, textAlign: 'center' }}>No hay ofertas con estos filtros. Prueba a ampliar la distancia o el precio.</Text>
            <Button label="Quitar filtros" variant="ghost" onPress={() => setFilters(defaultFilters)} />
          </View>
        )
      }
      renderItem={({ item, index }) => (
        <View style={{ flex: 1, maxWidth: index === deals.length - 1 && deals.length % 2 ? '50%' : undefined }}>
          <ListingCard l={item} />
        </View>
      )}
    />
  );
}
