import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CATEGORIES } from '@/lib/platforms';
import { activeFilterCount } from '@/lib/scoring';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';
import type { CategoryId } from '@/lib/types';

import { Chip } from './ui';

/** Barra de búsqueda con botón de filtros dentro, categorías con icono y filtros rápidos. */
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
  const setCat = (category: CategoryId | 'all') => setFilters({ ...filters, category: filters.category === category ? 'all' : category });
  const near = !filters.nationwide;

  return (
    <View style={{ gap: 14 }}>
      <View style={[styles.search, { backgroundColor: t.surface2 }]}>
        <Ionicons name="search" size={20} color={t.muted} />
        <TextInput
          value={query}
          onChangeText={onChangeQuery}
          onSubmitEditing={(e) => onSubmit?.(e.nativeEvent.text)}
          onFocus={() => !onChangeQuery && router.navigate('/search')}
          placeholder="¿Qué estás buscando?"
          placeholderTextColor={t.muted}
          returnKeyType="search"
          style={{ flex: 1, color: t.ink, paddingVertical: 13, fontSize: 16 }}
        />
        <Pressable
          onPress={() => router.push('/filters')}
          accessibilityRole="button"
          accessibilityLabel="Filtros"
          style={[styles.filterBtn, { backgroundColor: n ? t.ink : t.bg }]}>
          <Ionicons name="options-outline" size={18} color={n ? t.bg : t.ink} />
          {n > 0 && <Text style={{ color: t.bg, fontWeight: '800', fontSize: 12 }}>{n}</Text>}
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
        {(Object.keys(CATEGORIES) as CategoryId[]).map((k) => {
          const on = filters.category === k;
          return (
            <Pressable key={k} onPress={() => setCat(k)} accessibilityRole="button" accessibilityState={{ selected: on }} style={{ alignItems: 'center', gap: 6, width: 62 }}>
              <View style={[styles.catIcon, { backgroundColor: on ? t.ink : t.surface2 }]}>
                <Ionicons name={CATEGORIES[k].icon as never} size={24} color={on ? t.bg : t.ink} />
              </View>
              <Text numberOfLines={1} style={{ color: t.ink, fontSize: 11.5, fontWeight: on ? '700' : '500' }}>
                {CATEGORIES[k].name.split(' ')[0]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        <Chip icon="location-outline" label="Cerca de mí" active={near} onPress={() => setFilters({ ...filters, nationwide: near, radiusKm: filters.radiusKm || 50 })} />
        <Chip icon="cube-outline" label="Con envío" active={filters.delivery === 'shipping'} onPress={() => setFilters({ ...filters, delivery: filters.delivery === 'shipping' ? 'any' : 'shipping' })} />
        <Chip icon="hand-left-outline" label="En mano" active={filters.delivery === 'inPerson'} onPress={() => setFilters({ ...filters, delivery: filters.delivery === 'inPerson' ? 'any' : 'inPerson' })} />
        <Chip icon="sparkles-outline" label="Como nuevo" active={filters.conditions.length === 1 && filters.conditions[0] === 'mb'} onPress={() => setFilters({ ...filters, conditions: filters.conditions[0] === 'mb' && filters.conditions.length === 1 ? [] : ['mb'] })} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, paddingLeft: 14, paddingRight: 6 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 9 },
  catIcon: { width: 54, height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
