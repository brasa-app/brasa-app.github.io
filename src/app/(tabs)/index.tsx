import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';

import { ListingCard } from '@/components/listing-card';
import { SearchHeader } from '@/components/search-header';
import { Button, Note, Sub, Title } from '@/components/ui';
import { heatScore, isSafe, passesFilters } from '@/lib/scoring';
import { trendingAll } from '@/lib/sources';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';
import { defaultFilters, type Listing } from '@/lib/types';

/** Cada cuánto se refrescan las ofertas TOP. */
const REFRESH_MS = 60_000;

export default function TopDeals() {
  const t = useTheme();
  const { filters, setFilters } = useStore();
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
    const c = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(r);
      clearInterval(c);
    };
  }, [load]);

  const visible = useMemo(() => all.filter((l) => passesFilters(l, filters)), [all, filters]);
  const deals = useMemo(() => visible.filter(isSafe).sort((a, b) => heatScore(b) - heatScore(a)), [visible]);
  const hidden = visible.length - deals.length;

  return (
    <FlatList
      data={deals}
      keyExtractor={(l) => l.id}
      numColumns={2}
      columnWrapperStyle={{ gap: 10 }}
      contentContainerStyle={{ padding: 16, gap: 10, maxWidth: 720, width: '100%', alignSelf: 'center' }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={t.ember} />}
      ListHeaderComponent={
        <View style={{ gap: 14, marginBottom: 4 }}>
          <SearchHeader />
          <View>
            <Title>Está que arde 🔥</Title>
            <Sub>
              Los chollos más virales de todas las plataformas, con vendedor comprobado. Actualizado hace{' '}
              {Math.round((now - updatedAt) / 1000)} s.
            </Sub>
          </View>
          {hidden > 0 && (
            <Note>
              🛡 Hemos ocultado {hidden} anuncio{hidden > 1 ? 's' : ''} con señales de estafa (precio irreal o cuenta sin
              historial).
            </Note>
          )}
        </View>
      }
      ListEmptyComponent={
        loading ? null : (
          <View style={{ gap: 12, alignItems: 'center', padding: 24 }}>
            <Text style={{ color: t.muted, textAlign: 'center' }}>
              No hay ofertas con estos filtros. Prueba a ampliar la distancia o el precio.
            </Text>
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
