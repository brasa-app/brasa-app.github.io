import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ListingRow } from '@/components/listing-card';
import { Sub, Title } from '@/components/ui';
import { isSafe } from '@/lib/scoring';
import { trendingAll } from '@/lib/sources';
import { useTheme } from '@/lib/theme';
import type { Listing } from '@/lib/types';

const RINGS = [
  { max: 10, label: 'A menos de 10 km' },
  { max: 50, label: 'De 10 a 50 km' },
  { max: 100, label: 'De 50 a 100 km' },
];

export default function Nearby() {
  const t = useTheme();
  const [all, setAll] = useState<Listing[]>([]);
  useEffect(() => {
    trendingAll().then(setAll);
  }, []);
  const near = useMemo(() => all.filter((l) => isSafe(l) && l.distanceKm <= 100).sort((a, b) => a.distanceKm - b.distanceKm), [all]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14, maxWidth: 720, width: '100%', alignSelf: 'center' }}>
      <Title>Chollos cerca de ti</Title>
      <Sub>Para comprar en mano y verlo antes de pagar. Las distancias se calculan desde la dirección de tu perfil.</Sub>
      {/* Radar: cada punto es un chollo, más cerca del centro = más cerca de ti */}
      <View style={{ alignSelf: 'center', width: 240, height: 240, alignItems: 'center', justifyContent: 'center' }}>
        {[240, 160, 80].map((d) => (
          <View key={d} style={{ position: 'absolute', width: d, height: d, borderRadius: d / 2, borderWidth: 1, borderColor: t.line, backgroundColor: d === 80 ? t.emberSoft : 'transparent' }} />
        ))}
        {near.map((l, i) => {
          const r = Math.min(1, l.distanceKm / 100) * 112;
          const a = (i * 137.5 * Math.PI) / 180;
          return <View key={l.id} style={{ position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: t.ember, transform: [{ translateX: Math.cos(a) * r }, { translateY: Math.sin(a) * r }] }} />;
        })}
        <Ionicons name="location-outline" size={18} color={t.ink} />
      </View>
      {RINGS.map((ring, i) => {
        const min = i ? RINGS[i - 1].max : 0;
        const list = near.filter((l) => l.distanceKm > min && l.distanceKm <= ring.max);
        if (!list.length) return null;
        return (
          <View key={ring.label} style={{ gap: 8 }}>
            <Text style={{ color: t.ink, fontWeight: '700' }}>
              {ring.label} · {list.length}
            </Text>
            {list.map((l) => <ListingRow key={l.id} l={l} />)}
          </View>
        );
      })}
    </ScrollView>
  );
}
