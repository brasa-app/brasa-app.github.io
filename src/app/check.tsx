import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { Box, Button, Note, Sub, Title } from '@/components/ui';
import { analyzeScreenshot, type ScreenshotAnalysis } from '@/lib/ai';
import { euros } from '@/lib/platforms';
import { trustChecks, trustLevel, trustScore } from '@/lib/scoring';
import { useTheme } from '@/lib/theme';
import type { Listing } from '@/lib/types';

function asListing(a: ScreenshotAnalysis): Listing {
  return {
    id: 'check', title: a.title, category: 'hogar', platform: 'brasa', url: '', price: a.price, marketPrice: a.marketPrice,
    condition: 'mb', conditionByAI: false, city: '', distanceKm: 0, shipping: true, inPerson: true, views: 0, favorites: 0,
    publishedAt: Date.now(), tint: '#fff',
    seller: { name: a.sellerName, accountAgeMonths: a.accountAgeMonths, reviews: a.reviews, stars: a.stars, verifications: a.verifications, sales: a.reviews },
  };
}

export default function CheckListing() {
  const t = useTheme();
  const [uri, setUri] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScreenshotAnalysis>();

  async function pick() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (res.canceled) return;
    setUri(res.assets[0].uri);
    setResult(undefined);
    setLoading(true);
    setResult(await analyzeScreenshot(res.assets[0].uri));
    setLoading(false);
  }

  const l = result && asListing(result);
  const score = l ? trustScore(l) : 0;
  const color = { ok: t.ok, warn: t.warn, bad: t.bad }[trustLevel(score)];
  const icon = { ok: '✓', warn: '!', bad: '✕' } as const;
  const fg = { ok: t.ok, warn: t.warn, bad: t.bad } as const;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
      <Title>¿Es fiable este anuncio?</Title>
      <Sub>
        Haz una captura de pantalla de cualquier anuncio (Wallapop, Vinted, Milanuncios…) y súbela. La IA lee el precio, el
        vendedor y las señales de estafa.
      </Sub>
      <Button label={uri ? 'Subir otra captura' : 'Subir captura'} onPress={pick} />
      {uri && <Image source={uri} style={{ width: '100%', aspectRatio: 9 / 12, borderRadius: 14, maxWidth: 360, alignSelf: 'center' }} contentFit="contain" />}
      {loading && (
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <ActivityIndicator color={t.ember} />
          <Sub>Analizando la captura…</Sub>
        </View>
      )}
      {result && l && (
        <Box>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.ink, fontWeight: '700' }}>{result.title}</Text>
              <Sub>
                {euros(result.price)} en {result.platform} · {result.sellerName}
              </Sub>
            </View>
            <Text style={{ color, fontSize: 40, fontWeight: '800' }}>{score}</Text>
          </View>
          {trustChecks(l).map((c) => (
            <View key={c.label} style={{ flexDirection: 'row', gap: 8 }}>
              <Text style={{ color: fg[c.level], fontWeight: '800', width: 16 }}>{icon[c.level]}</Text>
              <Text style={{ color: t.ink, flex: 1 }}>{c.label}</Text>
              <Text style={{ color: t.muted, fontSize: 12 }}>{c.value}</Text>
            </View>
          ))}
          {result.warnings.map((w) => (
            <View key={w} style={{ flexDirection: 'row', gap: 8 }}>
              <Text style={{ color: t.bad, fontWeight: '800', width: 16 }}>✕</Text>
              <Text style={{ color: t.ink, flex: 1 }}>{w}</Text>
            </View>
          ))}
          {trustLevel(score) === 'bad' && <Note tone="bad">Tiene varias señales de estafa. No pagues fuera de la plataforma.</Note>}
        </Box>
      )}
      {!process.env.EXPO_PUBLIC_API_URL && result && <Sub>Resultado de ejemplo: el análisis real se activará al conectar el servidor de IA.</Sub>}
    </ScrollView>
  );
}
