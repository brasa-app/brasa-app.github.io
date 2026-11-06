import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CATEGORIES, CONDITIONS, PLATFORMS, euros } from '@/lib/platforms';
import { discountPct, heatScore, trustLevel, trustScore } from '@/lib/scoring';
import { useStore } from '@/lib/store';
import { font, radius, useTheme } from '@/lib/theme';
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
        <Ionicons name={CATEGORIES[l.category].icon as never} size={emojiSize * 0.7} color="#a59d95" />
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

export function ListingCard({ l }: { l: Listing; showHeat?: boolean }) {
  const t = useTheme();
  const pct = discountPct(l);
  return (
    <Pressable onPress={() => open(l)} style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}>
      <View style={{ borderRadius: radius, overflow: 'hidden' }}>
        <ListingImage l={l} />
        {pct >= 10 && <Text style={[styles.deal, { backgroundColor: t.ember, color: '#fff' }]}>−{pct}%</Text>}
        <FavButton l={l} />
      </View>
      <View style={{ paddingTop: 8, gap: 1 }}>
        <Text style={[styles.price, { color: t.ink }]}>{euros(l.price)}</Text>
        <Text numberOfLines={1} style={{ color: t.ink, fontSize: 14 }}>
          {l.title}
        </Text>
        <Text numberOfLines={1} style={{ color: t.muted, fontSize: 12, marginTop: 2 }}>
          {PLATFORMS[l.platform].name} · {CONDITIONS[l.condition].label.toLowerCase()} · {l.distanceKm} km
        </Text>
      </View>
    </Pressable>
  );
}

export function ListingRow({ l }: { l: Listing }) {
  const t = useTheme();
  return (
    <Pressable onPress={() => open(l)} style={[styles.row, { borderColor: t.line }]}>
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
  deal: { position: 'absolute', bottom: 8, left: 8, fontWeight: '800', fontSize: 12, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, overflow: 'hidden' },
  fav: { position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  plat: { position: 'absolute', bottom: 8, left: 8, fontSize: 11, fontWeight: '700', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, overflow: 'hidden' },
  price: { fontSize: 18, fontFamily: font.heavy, fontWeight: '800', letterSpacing: -0.3, fontVariant: ['tabular-nums'] },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center', borderBottomWidth: 1, paddingVertical: 10 },
});
