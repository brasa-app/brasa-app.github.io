import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ListingImage, delivery } from '@/components/listing-card';
import { Box, Button, copyText, ConditionBadge, Note, Sub, Title } from '@/components/ui';
import { CATEGORIES, CONDITIONS, PLATFORMS, euros } from '@/lib/platforms';
import { trustChecks, trustLevel, trustScore } from '@/lib/scoring';
import { getListing } from '@/lib/sources';
import { useState } from 'react';
import { router } from 'expo-router';
import { Chip } from '@/components/ui';
import { priceHistory, suggestedOffer } from '@/lib/pricing';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

export default function ListingDetail() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { favorites, toggleFavorite, report, blockSeller, reported } = useStore();
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState<string>();
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
  const offer = suggestedOffer(l);
  const history = priceHistory(l);
  const hMin = Math.min(...history.map((h) => h.price));
  const hMax = Math.max(...history.map((h) => h.price));
  const minutes = Math.max(1, Math.round((Date.now() - l.publishedAt) / 60000));

  return (
    <View style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 16, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
      <Stack.Screen options={{ title: PLATFORMS[l.platform].name }} />
      <ListingImage l={l} emojiSize={90} style={{ aspectRatio: 4 / 3, borderRadius: 16 }} />
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

      <Box>
        <Text style={{ color: t.ink, fontWeight: '700', fontSize: 15 }}>Oferta sugerida: {euros(offer.offer)}</Text>
        <Sub>{offer.note}</Sub>
        <Button
          variant="ghost"
          label="Copiar mensaje para el vendedor"
          onPress={() => copyText(`¡Hola! Me interesa tu ${l.title}. ¿Aceptarías ${euros(offer.offer)}? Puedo recogerlo o pagar el envío por la plataforma.`)}
        />
      </Box>

      <Box>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={{ color: t.ink, fontWeight: '700', fontSize: 15 }}>Historial de precio</Text>
          <Sub>Precio medio, 8 semanas</Sub>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 110 }}>
          {history.map((h, i) => (
            <View key={h.week} style={{ flex: 1, alignItems: 'center', gap: 4, justifyContent: 'flex-end', height: '100%' }}>
              <View style={{ width: '100%', borderRadius: 4, backgroundColor: i === history.length - 1 ? t.ember : t.surface2, height: `${Math.max(8, ((h.price - hMin) / (hMax - hMin || 1)) * 70 + 20)}%` }} />
              <Text style={{ color: t.muted, fontSize: 9 }}>{h.week}</Text>
            </View>
          ))}
        </View>
        <Sub>
          Hoy se vende de media por {euros(history[history.length - 1].price)}. Este anuncio está{' '}
          {l.price < history[history.length - 1].price ? `${euros(history[history.length - 1].price - l.price)} por debajo` : `${euros(l.price - history[history.length - 1].price)} por encima`}.
          {' '}Datos de ejemplo hasta tener histórico real.
        </Sub>
      </Box>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button style={{ flex: 1 }} variant="ghost" label={fav ? '♥ En favoritos' : '♡ Favorito'} onPress={() => toggleFavorite(l.id)} />
        <Button
          style={{ flex: 1 }}
          variant="ghost"
          label="Compartir"
          onPress={() => copyText(`${l.title} por ${euros(l.price)} en ${PLATFORMS[l.platform].name}: ${l.url}`)}
        />
      </View>
      <Box>
        {reported.includes(l.id) ? (
          <Sub>Gracias. Hemos recibido tu denuncia y ya no verás este anuncio.</Sub>
        ) : !reporting ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button style={{ flex: 1 }} variant="ghost" label="🚩 Denunciar" onPress={() => setReporting(true)} />
            <Button
              style={{ flex: 1 }}
              variant="ghost"
              label={`Bloquear a ${l.seller.name}`}
              onPress={() => {
                blockSeller(l.seller.name);
                router.back();
              }}
            />
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <Text style={{ color: t.ink, fontWeight: '700' }}>¿Qué pasa con este anuncio?</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {['Es una estafa', 'Precio o fotos falsos', 'Producto prohibido', 'Ofensivo', 'Otro motivo'].map((r) => (
                <Chip key={r} label={r} active={reason === r} onPress={() => setReason(r)} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button style={{ flex: 1 }} variant="ghost" label="Cancelar" onPress={() => setReporting(false)} />
              <Button style={{ flex: 1 }} label="Enviar denuncia" disabled={!reason} onPress={() => report(l.id)} />
            </View>
          </View>
        )}
      </Box>

      <Sub>
        La compra se hace en {PLATFORMS[l.platform].name}, con su pago protegido. Consejos: no pagues nunca por Bizum o
        transferencia fuera de la plataforma, y desconfía si te piden hablar por WhatsApp o te envían enlaces de pago.
      </Sub>
    </ScrollView>
      <View style={[styles.bar, { backgroundColor: t.surface, borderTopColor: t.line }]}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.ink, fontSize: 22, fontWeight: '800' }}>{euros(l.price)}</Text>
          <Text style={{ color: t.muted, fontSize: 12 }}>{delivery(l)}</Text>
        </View>
        <Button label={`Ver en ${PLATFORMS[l.platform].name}`} href={l.url} style={{ paddingHorizontal: 22 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1 },
  hero: { aspectRatio: 16 / 10, borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  ic: { width: 20, height: 20, borderRadius: 10, textAlign: 'center', lineHeight: 20, fontSize: 12, fontWeight: '800', overflow: 'hidden' },
});
