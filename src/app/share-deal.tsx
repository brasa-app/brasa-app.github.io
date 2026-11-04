import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Pressable } from 'react-native';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { Button, Chip, Sub } from '@/components/ui';
import { CATEGORIES, PLATFORMS } from '@/lib/platforms';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';
import type { CategoryId, PlatformId } from '@/lib/types';

const SHAREABLE: PlatformId[] = ['wallapop', 'vinted', 'milanuncios', 'ebay', 'cochesnet', 'motosnet', 'todocoleccion'];

/** Detecta la plataforma a partir del enlace pegado. */
function platformFromUrl(url: string): PlatformId | undefined {
  const u = url.toLowerCase();
  if (u.includes('wallapop')) return 'wallapop';
  if (u.includes('vinted')) return 'vinted';
  if (u.includes('milanuncios')) return 'milanuncios';
  if (u.includes('ebay')) return 'ebay';
  if (u.includes('motos.coches')) return 'motosnet';
  if (u.includes('coches.net')) return 'cochesnet';
  if (u.includes('todocoleccion')) return 'todocoleccion';
}

export default function ShareDeal() {
  const t = useTheme();
  const { addDeal, profile } = useStore();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [platform, setPlatform] = useState<PlatformId>('wallapop');
  const [category, setCategory] = useState<CategoryId>('consolas');
  const [photo, setPhoto] = useState<string>();

  async function pickPhoto() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!res.canceled) setPhoto(res.assets[0].uri);
  }

  const validUrl = /^https?:\/\/\S+\.\S+/.test(url.trim());
  const ok = validUrl && title.trim().length > 3 && Number(price) > 0;
  const input = { borderWidth: 1, borderColor: t.line, backgroundColor: t.surface2, borderRadius: 10, padding: 12, color: t.ink, fontSize: 15 };
  const label = { color: t.ink, fontWeight: '600' as const, fontSize: 14 };

  return (
    <ScrollView contentContainerStyle={{ padding: 18, gap: 12, maxWidth: 560, width: '100%', alignSelf: 'center' }} keyboardShouldPersistTaps="handled">
      <Text style={label}>Enlace del anuncio</Text>
      <TextInput
        value={url}
        onChangeText={(v) => {
          setUrl(v);
          const p = platformFromUrl(v);
          if (p) setPlatform(p);
        }}
        placeholder="https://es.wallapop.com/item/…"
        placeholderTextColor={t.muted}
        autoCapitalize="none"
        keyboardType="url"
        style={input}
      />
      {url.length > 5 && !validUrl && <Sub>Pega el enlace completo, empezando por https://</Sub>}
      <Text style={label}>Foto</Text>
      <Pressable onPress={pickPhoto} accessibilityRole="button" accessibilityLabel="Añadir foto"
        style={{ width: 110, height: 110, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: t.muted, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {photo ? <Image source={photo} style={{ width: 110, height: 110 }} contentFit="cover" /> : <Text style={{ color: t.muted, fontSize: 13, textAlign: 'center' }}>＋{'\n'}Captura o foto</Text>}
      </Pressable>
      <Text style={label}>¿Qué es?</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder="Ej.: PS5 con 2 mandos" placeholderTextColor={t.muted} style={input} />
      <Text style={label}>Precio</Text>
      <TextInput value={price} onChangeText={(v) => setPrice(v.replace(/\D/g, ''))} placeholder="€" placeholderTextColor={t.muted} keyboardType="numeric" style={input} />
      <Text style={label}>Plataforma</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {SHAREABLE.map((p) => <Chip key={p} label={PLATFORMS[p].name} active={platform === p} onPress={() => setPlatform(p)} />)}
      </View>
      <Text style={label}>Categoría</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {(Object.keys(CATEGORIES) as CategoryId[]).map((c) => (
          <Chip key={c} label={`${CATEGORIES[c].emoji} ${CATEGORIES[c].name}`} active={category === c} onPress={() => setCategory(c)} />
        ))}
      </View>
      <Button
        label="Compartir chollo"
        disabled={!ok}
        onPress={() => {
          addDeal({ title: title.trim(), price: Number(price), url: url.trim(), platform, category, author: profile.name || 'Anónimo', imageUrl: photo });
          router.back();
        }}
      />
      <Sub>Comparte solo anuncios reales. Los chollos con muchos votos ❄️ o denuncias se retiran.</Sub>
    </ScrollView>
  );
}
