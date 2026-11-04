import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import { ListingRow, delivery } from '@/components/listing-card';
import { SearchHeader } from '@/components/search-header';
import { Box, Button, Chip, ConditionBadge, Sub, Title, TrustPill } from '@/components/ui';
import { PLATFORMS, euros } from '@/lib/platforms';
import { bestPicks, passesFilters, trustScore } from '@/lib/scoring';
import { searchAll } from '@/lib/sources';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';
import type { Listing } from '@/lib/types';
import { router } from 'expo-router';

const POPULAR = ['iPhone 13', 'PS5', 'Nike Dunk', 'Thermomix', 'Seat León', 'MacBook Air'];

function PickCard({ l, label, color }: { l?: Listing; label: string; color: string }) {
  const t = useTheme();
  if (!l) return <View style={{ flex: 1 }} />;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/listing/[id]', params: { id: l.id } })}
      style={{ flex: 1, borderWidth: 2, borderColor: color, borderRadius: 14, padding: 12, gap: 5, backgroundColor: t.surface }}>
      <Text style={{ color, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 }}>{label.toUpperCase()}</Text>
      <Text style={{ color: t.ink, fontSize: 20, fontWeight: '800' }}>{euros(l.price)}</Text>
      <Text numberOfLines={1} style={{ color: t.ink }}>{l.title}</Text>
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        <ConditionBadge condition={l.condition} byAI={l.conditionByAI} />
        <TrustPill score={trustScore(l)} />
      </View>
      <Text style={{ color: t.muted, fontSize: 11.5 }} numberOfLines={1}>
        {PLATFORMS[l.platform].name} · {l.distanceKm} km · {delivery(l)}
      </Text>
    </Pressable>
  );
}

export default function Search() {
  const t = useTheme();
  const params = useLocalSearchParams<{ q?: string }>();
  const { filters, savedSearches, saveSearch, isHidden } = useStore();
  const [query, setQuery] = useState(params.q ?? '');
  const [submitted, setSubmitted] = useState(params.q ?? '');
  const [results, setResults] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!submitted) return;
    let alive = true;
    setLoading(true);
    searchAll(submitted).then((r) => {
      if (alive) {
        setResults(r);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [submitted]);

  // Búsqueda mientras se escribe, con una pequeña espera
  useEffect(() => {
    const id = setTimeout(() => setSubmitted(query.trim()), 400);
    return () => clearTimeout(id);
  }, [query]);

  const visible = useMemo(() => results.filter((l) => passesFilters(l, filters) && !isHidden(l)).sort((a, b) => a.price - b.price), [results, filters, isHidden]);
  const { cheapest, bestValue } = bestPicks(visible);
  const platforms = new Set(visible.map((l) => l.platform)).size;
  const saved = savedSearches.some((s) => s.query === submitted);

  const header = (
    <View style={{ gap: 14, marginBottom: 4 }}>
      <SearchHeader query={query} onChangeQuery={setQuery} onSubmit={(q) => setSubmitted(q.trim())} />
      {!submitted ? (
        <>
          <View>
            <Title>Buscador</Title>
            <Sub>Escribe lo que buscas y lo comparamos en todas las webs de segunda mano a la vez.</Sub>
          </View>
          <Box>
            <Text style={{ color: t.ink, fontWeight: '600' }}>Búsquedas populares</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {POPULAR.map((p) => (
                <Chip key={p} label={p} onPress={() => setQuery(p)} />
              ))}
            </View>
          </Box>
          {savedSearches.length > 0 && (
            <Box>
              <Text style={{ color: t.ink, fontWeight: '600' }}>Tus alertas</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {savedSearches.map((s) => (
                  <Chip key={s.query} label={`🔔 ${s.query}`} onPress={() => setQuery(s.query)} />
                ))}
              </View>
            </Box>
          )}
        </>
      ) : loading ? (
        <ActivityIndicator color={t.ember} style={{ marginTop: 24 }} />
      ) : (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Title size={20}>“{submitted}”</Title>
              <Sub>
                {visible.length} anuncios en {platforms} plataformas
                {visible[0] ? ` · precio de mercado ${euros(visible[0].marketPrice)}` : ''}
              </Sub>
            </View>
            <Chip label={saved ? '🔔 Alerta creada' : '🔔 Crear alerta'} active={saved} onPress={() => saveSearch({ query: submitted })} />
          </View>
          {visible.length > 0 && (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <PickCard l={cheapest} label="🔥 Más barato fiable" color={t.ember} />
              <PickCard l={bestValue} label="⭐ Mejor estado/precio" color={t.ok} />
            </View>
          )}
          {visible.length > 0 && <Text style={{ color: t.ink, fontWeight: '600' }}>Todos, del más barato al más caro</Text>}
        </>
      )}
    </View>
  );

  return (
    <FlatList
      data={submitted && !loading ? visible : []}
      keyExtractor={(l) => l.id}
      contentContainerStyle={{ padding: 16, gap: 8, maxWidth: 720, width: '100%', alignSelf: 'center' }}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={header}
      ListEmptyComponent={
        submitted && !loading ? (
          <View style={{ alignItems: 'center', gap: 10, padding: 24 }}>
            <Text style={{ color: t.muted, textAlign: 'center' }}>No hay anuncios con estos filtros.</Text>
            <Button label="Cambiar filtros" variant="ghost" onPress={() => router.push('/filters')} />
          </View>
        ) : null
      }
      renderItem={({ item }) => <ListingRow l={item} />}
    />
  );
}
