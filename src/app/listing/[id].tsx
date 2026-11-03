import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { delivery } from '@/components/listing-card';
import { Box, Button, copyText, ConditionBadge, Note, Sub, Title } from '@/components/ui';
import { CATEGORIES, CONDITIONS, PLATFORMS, euros } from '@/lib/platforms';
import { trustChecks, trustLevel, trustScore } from '@/lib/scoring';
import { getListing } from '@/lib/sources';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

export default function ListingDetail() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { favorites, toggleFavorite } = useStore();
  const l = getListing(id);

  if (!l) {
    return (
      <View style={{ padding: 24, gap: 12 }}>
        <Title size={20}>Este anuncio ya no está disponible</Title>
        <Sub>Puede que se haya vendido o que el vendedor lo haya retirado.</Sub>
      </View>
    );
  }

  const score = trustScore(l);
  const lvl = trustLevel(score);
  const color = { ok: t.ok, warn: t.warn, bad: t.bad }[lvl];
  const icon = { ok: '✓', warn: '!', bad: '✕' } as const;
  const soft = { ok: t.okSoft, warn: t.warnSoft, bad: t.badSoft } as const;
  const fg = { ok: t.ok, warn: t.warn, bad: t.bad } as const;
  const fav = favorites.includes(l.id);
  const minutes = Math.max(1, Math.round((Date.now() - l.publishedAt) / 60000));

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
      <Stack.Screen options={{ title: PLATFORMS[l.platform].name }} />
      <View style={[styles.hero, { backgroundColor: l.tint }]}>
        {l.imageUrl ? (
          <Image source={l.imageUrl} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <Text style={{ fontSize: 90 }}>{CATEGORIES[l.category].emoji}</Text>
        )}
      </View>
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Title size={28}>{euros(l.price)}</Title>
          <Text style={{ color: t.muted }}>mercado {euros(l.marketPrice)}</Text>
        </View>
        <Title size={20}>{l.title}</Title>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <ConditionBadge condition={l.condition} byAI={l.conditionByAI} />
          <Sub>
            {l.city} ({l.distanceKm} km) · {delivery(l)} · hace {minutes} min
          </Sub>
        </View>
      </View>

      {l.conditionByAI && (
        <Note>
          🤖 El vendedor no indicó el estado. Nuestra IA lo estima como {CONDITIONS[l.condition].label.toLowerCase()} a partir de
          las fotos (marcas visibles, desgaste y accesorios).
        </Note>
      )}

      <Box>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: t.ink, fontWeight: '700', fontSize: 15 }}>Fiabilidad del vendedor</Text>
            <Sub>
              {l.seller.name} · {l.seller.sales} ventas
            </Sub>
          </View>
          <Text style={{ color, fontSize: 40, fontWeight: '800' }}>{score}</Text>
        </View>
        <View style={{ height: 8, borderRadius: 4, backgroundColor: t.surface2, overflow: 'hidden' }}>
          <View style={{ width: `${score}%`, height: '100%', backgroundColor: color, borderRadius: 4 }} />
        </View>
        {trustChecks(l).map((c) => (
          <View key={c.label} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Text style={[styles.ic, { backgroundColor: soft[c.level], color: fg[c.level] }]}>{icon[c.level]}</Text>
            <Text style={{ color: t.ink, flex: 1 }}>{c.label}</Text>
            <Text style={{ color: t.muted, fontSize: 12 }}>{c.value}</Text>
          </View>
        ))}
        {lvl === 'bad' && (
          <Note tone="bad">
            No recomendamos esta compra. El precio está muy por debajo del mercado y la cuenta no tiene historial.
          </Note>
        )}
      </Box>

      <Button label={`Ver en ${PLATFORMS[l.platform].name}`} href={l.url} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button style={{ flex: 1 }} variant="ghost" label={fav ? '♥ En favoritos' : '♡ Favorito'} onPress={() => toggleFavorite(l.id)} />
        <Button
          style={{ flex: 1 }}
          variant="ghost"
          label="Compartir"
          onPress={() => copyText(`${l.title} por ${euros(l.price)} en ${PLATFORMS[l.platform].name}: ${l.url}`)}
        />
      </View>
      <Sub>
        La compra se hace en {PLATFORMS[l.platform].name}, con su pago protegido. Consejos: no pagues nunca por Bizum o
        transferencia fuera de la plataforma, y desconfía si te piden hablar por WhatsApp o te envían enlaces de pago.
      </Sub>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { aspectRatio: 16 / 10, borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  ic: { width: 20, height: 20, borderRadius: 10, textAlign: 'center', lineHeight: 20, fontSize: 12, fontWeight: '800', overflow: 'hidden' },
});
