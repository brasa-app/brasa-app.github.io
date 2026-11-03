import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { Button, Chip } from '@/components/ui';
import { CONDITIONS } from '@/lib/platforms';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';
import { defaultFilters, type Condition, type Filters } from '@/lib/types';

const RADII = [5, 10, 25, 50, 100, 200, 400];

export default function FiltersScreen() {
  const t = useTheme();
  const { filters, setFilters } = useStore();
  const [f, setF] = useState<Filters>(filters);
  const [min, setMin] = useState(filters.minPrice?.toString() ?? '');
  const [max, setMax] = useState(filters.maxPrice?.toString() ?? '');

  const num = (s: string) => (s.trim() === '' ? undefined : Number(s.replace(/\D/g, '')));
  const toggleCond = (c: Condition) =>
    setF({ ...f, conditions: f.conditions.includes(c) ? f.conditions.filter((x) => x !== c) : [...f.conditions, c] });

  const label = { color: t.ink, fontWeight: '600' as const, fontSize: 14 };
  const input = { flex: 1, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface2, borderRadius: 10, padding: 12, color: t.ink };

  return (
    <ScrollView contentContainerStyle={{ padding: 18, gap: 22, maxWidth: 560, width: '100%', alignSelf: 'center' }}>
      <View style={{ gap: 8 }}>
        <Text style={label}>Distancia</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Chip label="Todo el país" active={f.nationwide} onPress={() => setF({ ...f, nationwide: true })} />
          <Chip label="Cerca de mí" active={!f.nationwide} onPress={() => setF({ ...f, nationwide: false })} />
        </View>
        {!f.nationwide && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {RADII.map((r) => (
              <Chip key={r} label={`${r} km`} active={f.radiusKm === r} onPress={() => setF({ ...f, radiusKm: r })} />
            ))}
          </View>
        )}
      </View>
      <View style={{ gap: 8 }}>
        <Text style={label}>Precio</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput value={min} onChangeText={setMin} placeholder="Mínimo €" placeholderTextColor={t.muted} keyboardType="numeric" style={input} />
          <TextInput value={max} onChangeText={setMax} placeholder="Máximo €" placeholderTextColor={t.muted} keyboardType="numeric" style={input} />
        </View>
      </View>
      <View style={{ gap: 8 }}>
        <Text style={label}>Estado</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {(Object.keys(CONDITIONS) as Condition[]).map((c) => (
            <Chip key={c} label={CONDITIONS[c].label} active={f.conditions.includes(c)} onPress={() => toggleCond(c)} />
          ))}
        </View>
      </View>
      <View style={{ gap: 8 }}>
        <Text style={label}>Forma de compra</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {([['any', 'Todas'], ['shipping', 'Con envío'], ['inPerson', 'En mano']] as const).map(([k, v]) => (
            <Chip key={k} label={v} active={f.delivery === k} onPress={() => setF({ ...f, delivery: k })} />
          ))}
        </View>
      </View>
      <View style={{ gap: 10 }}>
        <Button
          label="Ver resultados"
          onPress={() => {
            setFilters({ ...f, minPrice: num(min), maxPrice: num(max) });
            router.back();
          }}
        />
        <Button
          label="Restablecer"
          variant="ghost"
          onPress={() => {
            setFilters({ ...defaultFilters, category: filters.category });
            router.back();
          }}
        />
      </View>
    </ScrollView>
  );
}
