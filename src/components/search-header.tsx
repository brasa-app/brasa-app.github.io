import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CATEGORIES } from '@/lib/platforms';
import { activeFilterCount } from '@/lib/scoring';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';
import type { CategoryId } from '@/lib/types';

import { Chip } from './ui';

export function SearchHeader({
  query,
  onChangeQuery,
  onSubmit,
}: {
  query?: string;
  onChangeQuery?: (q: string) => void;
  onSubmit?: (q: string) => void;
}) {
  const t = useTheme();
  const { filters, setFilters } = useStore();
  const n = activeFilterCount(filters);
  const setCat = (category: CategoryId | 'all') => setFilters({ ...filters, category });

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={[styles.search, { backgroundColor: t.surface2 }]}>
          <Ionicons name="search" size={18} color={t.muted} />
          <TextInput
            value={query}
            onChangeText={onChangeQuery}
            onSubmitEditing={(e) => onSubmit?.(e.nativeEvent.text)}
            onFocus={() => !onChangeQuery && router.navigate('/search')}
            placeholder="Busca en Wallapop, Vinted, Milanuncios…"
            placeholderTextColor={t.muted}
            returnKeyType="search"
            style={{ flex: 1, color: t.ink, paddingVertical: 10, fontSize: 15 }}
          />
        </View>
        <Pressable
          onPress={() => router.push('/filters')}
          accessibilityRole="button"
          accessibilityLabel="Filtros"
          style={[styles.filterBtn, { borderColor: t.line, backgroundColor: t.surface }]}>
          <Ionicons name="options-outline" size={18} color={t.ink} />
          <Text style={{ color: t.ink, fontWeight: '600' }}>Filtros</Text>
          {n > 0 && (
            <Text style={[styles.dot, { backgroundColor: t.ember, color: t.emberInk }]}>{n}</Text>
          )}
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        <Chip label="Todo" active={filters.category === 'all'} onPress={() => setCat('all')} />
        {(Object.keys(CATEGORIES) as CategoryId[]).map((k) => (
          <Chip
            key={k}
            label={`${CATEGORIES[k].emoji} ${CATEGORIES[k].name}`}
            active={filters.category === k}
            onPress={() => setCat(k)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 999, paddingHorizontal: 14 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12 },
  dot: { minWidth: 18, height: 18, borderRadius: 9, textAlign: 'center', fontSize: 11, lineHeight: 18, overflow: 'hidden', paddingHorizontal: 4 },
});
