import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CATEGORIES, PLATFORMS, euros } from '@/lib/platforms';
import { discountPct, heatScore, trustScore } from '@/lib/scoring';
import { radius, useTheme } from '@/lib/theme';
import type { Listing } from '@/lib/types';

import { ConditionBadge, TrustPill } from './ui';

export const delivery = (l: Listing) => [l.shipping && 'Envío', l.inPerson && 'En mano'].filter(Boolean).join(' · ');

function Thumb({ l, size = 'card' }: { l: Listing; size?: 'card' | 'row' }) {
  return (
    <View style={[styles.thumb, { backgroundColor: l.tint, borderRadius: size === 'row' ? 9 : 0 }]}>
      {l.imageUrl ? (
        <Image source={l.imageUrl} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <Text style={{ fontSize: size === 'row' ? 30 : 54 }}>{CATEGORIES[l.category].emoji}</Text>
      )}
    </View>
  );
}

export function ListingCard({ l, showHeat }: { l: Listing; showHeat?: boolean }) {
  const t = useTheme();
  const pct = discountPct(l);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/listing/[id]', params: { id: l.id } })}
      style={[styles.card, { backgroundColor: t.surface, borderColor: t.line }]}>
      <View>
        <Thumb l={l} />
        {showHeat && (
          <Text style={[styles.heat, { backgroundColor: t.ember, color: t.emberInk }]}>🔥 {heatScore(l)}</Text>
        )}
        <Text style={[styles.plat, { backgroundColor: t.surface, color: t.ink }]}>{PLATFORMS[l.platform].name}</Text>
      </View>
      <View style={{ padding: 10, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text style={[styles.price, { color: t.ink }]}>{euros(l.price)}</Text>
          {pct > 0 && <Text style={{ color: t.ok, fontWeight: '700', fontSize: 11 }}>−{pct}%</Text>}
        </View>
        <Text numberOfLines={1} style={{ color: t.ink, fontSize: 13.5 }}>
          {l.title}
        </Text>
        <View style={styles.meta}>
          <ConditionBadge condition={l.condition} byAI={l.conditionByAI} />
          <TrustPill score={trustScore(l)} />
        </View>
        <Text numberOfLines={1} style={{ color: t.muted, fontSize: 11.5 }}>
          {l.city} · {l.distanceKm} km · {delivery(l)}
        </Text>
      </View>
    </Pressable>
  );
}

export function ListingRow({ l }: { l: Listing }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/listing/[id]', params: { id: l.id } })}
      style={[styles.row, { backgroundColor: t.surface, borderColor: t.line }]}>
      <View style={{ width: 64 }}>
        <Thumb l={l} size="row" />
      </View>
      <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ color: t.ink, fontWeight: '600' }}>
          {l.title}
        </Text>
        <View style={styles.meta}>
          <ConditionBadge condition={l.condition} byAI={l.conditionByAI} />
          <TrustPill score={trustScore(l)} />
        </View>
        <Text numberOfLines={1} style={{ color: t.muted, fontSize: 11.5 }}>
          {PLATFORMS[l.platform].name} · {l.distanceKm} km · {delivery(l)}
        </Text>
      </View>
      <Text style={[styles.price, { color: t.ink, fontSize: 17 }]}>{euros(l.price)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: radius, borderWidth: 1, overflow: 'hidden' },
  thumb: { aspectRatio: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heat: { position: 'absolute', top: 8, left: 8, fontWeight: '700', fontSize: 11, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, overflow: 'hidden' },
  plat: { position: 'absolute', bottom: 8, left: 8, fontSize: 11, fontWeight: '600', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, overflow: 'hidden' },
  price: { fontSize: 19, fontWeight: '800', fontVariant: ['tabular-nums'] },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 8 },
});
