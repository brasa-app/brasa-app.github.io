import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CATEGORIES, CONDITIONS, PLATFORMS, euros } from '@/lib/platforms';
import { discountPct, heatScore, trustLevel, trustScore } from '@/lib/scoring';
import { useStore } from '@/lib/store';
import { radius, useTheme } from '@/lib/theme';
import type { Listing } from '@/lib/types';

import { ConditionBadge, TrustPill } from './ui';

export const delivery = (l: Listing) => [l.shipping && 'Envío', l.inPerson && 'En mano'].filter(Boolean).join(' · ');

const open = (l: Listing) => router.push({ pathname: '/listing/[id]', params: { id: l.id } });

export function ListingImage({ l, emojiSize = 54, style }: { l: Listing; emojiSize?: number; style?: object }) {
  return (
    <View style={[styles.thumb, { backgroundColor: l.tint }, style]}>
      {l.imageUrl != null ? (
        <Image source={l.imageUrl} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
      ) : (
        <Text style={{ fontSize: emojiSize }}>{CATEGORIES[l.category].emoji}</Text>
      )}
    </View>
  );
}

function FavButton({ l }: { l: Listing }) {
  const id = l.id;
  const t = useTheme();
  const { favorites, toggleFavorite } = useStore();
  const on = favorites.includes(id);
  return (
    <Pressable
      onPress={() => toggleFavorite(l)}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={on ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      style={[styles.fav, { backgroundColor: t.surface }]}>
      <Ionicons name={on ? 'heart' : 'heart-outline'} size={18} color={on ? t.ember : t.ink} />
    </Pressable>
  );
}

export function ListingCard({ l, showHeat }: { l: Listing; showHeat?: boolean }) {
  const t = useTheme();
  const pct = discountPct(l);
  const trust = trustScore(l);
  const trustColor = { ok: t.ok, warn: t.warn, bad: t.bad }[trustLevel(trust)];
  return (
    <Pressable onPress={() => open(l)} style={({ pressed }) => [styles.card, { opacity: pressed ? 0.9 : 1 }]}>
      <View style={{ borderRadius: radius, overflow: 'hidden' }}>
        <ListingImage l={l} />
        {showHeat && (
          <Text style={[styles.heat, { backgroundColor: t.ember, color: t.emberInk }]}>🔥 {heatScore(l)}</Text>
        )}
        <FavButton l={l} />
        <Text style={[styles.plat, { backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff' }]}>{PLATFORMS[l.platform].name}</Text>
      </View>
      <View style={{ paddingTop: 8, paddingHorizontal: 2, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text style={[styles.price, { color: t.ink }]}>{euros(l.price)}</Text>
          {pct > 0 && <Text style={{ color: t.ok, fontWeight: '700', fontSize: 12 }}>−{pct}%</Text>}
        </View>
        <Text numberOfLines={1} style={{ color: t.ink, fontSize: 14 }}>
          {l.title}
        </Text>
        <Text numberOfLines={1} style={{ color: t.muted, fontSize: 12 }}>
          {CONDITIONS[l.condition].label}
          {l.conditionByAI ? ' (IA)' : ''} · <Text style={{ color: trustColor, fontWeight: '700' }}>🛡 {trust}</Text> · {l.distanceKm} km
        </Text>
      </View>
    </Pressable>
  );
}

export function ListingRow({ l }: { l: Listing }) {
  const t = useTheme();
  return (
    <Pressable onPress={() => open(l)} style={[styles.row, { backgroundColor: t.surface, borderColor: t.line }]}>
      <ListingImage l={l} emojiSize={30} style={{ width: 72, borderRadius: 10 }} />
      <View style={{ flex: 1, gap: 4, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ color: t.ink, fontWeight: '600', fontSize: 15 }}>
          {l.title}
        </Text>
        <View style={styles.meta}>
          <ConditionBadge condition={l.condition} byAI={l.conditionByAI} />
          <TrustPill score={trustScore(l)} />
        </View>
        <Text numberOfLines={1} style={{ color: t.muted, fontSize: 12 }}>
          {PLATFORMS[l.platform].name} · {l.distanceKm} km · {delivery(l)}
        </Text>
      </View>
      <Text style={[styles.price, { color: t.ink, fontSize: 17 }]}>{euros(l.price)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  thumb: { aspectRatio: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heat: { position: 'absolute', top: 8, left: 8, fontWeight: '800', fontSize: 12, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, overflow: 'hidden' },
  fav: { position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  plat: { position: 'absolute', bottom: 8, left: 8, fontSize: 11, fontWeight: '700', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, overflow: 'hidden' },
  price: { fontSize: 19, fontWeight: '800', fontVariant: ['tabular-nums'] },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center', borderWidth: 1, borderRadius: 14, padding: 8 },
});
