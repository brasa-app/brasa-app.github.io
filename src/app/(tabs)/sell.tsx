import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Box, Button, Chip, copyText, ConditionBadge, Note, Sub, Title } from '@/components/ui';
import { estimateCondition, type ConditionEstimate } from '@/lib/ai';
import { CATEGORIES, CONDITIONS, PLATFORMS, PLATFORMS_BY_CATEGORY, euros } from '@/lib/platforms';
import { searchAll } from '@/lib/sources';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';
import type { CategoryId, Condition, PlatformId } from '@/lib/types';

/** Texto adaptado al estilo de cada plataforma. */
function adaptText(p: PlatformId, d: { title: string; price: string; desc: string; condition?: Condition; shipping: boolean }) {
  const cond = d.condition ? CONDITIONS[d.condition].label : '';
  const ship = d.shipping ? 'Envío disponible.' : 'Solo entrega en mano.';
  const tags = p === 'vinted' ? '\n\n#segundamano #' + d.title.split(' ')[0].toLowerCase() : '';
  return `${d.title}\n${d.price} €\nEstado: ${cond}\n\n${d.desc}\n\n${ship}${tags}`;
}

export default function Sell() {
  const t = useTheme();
  const { profile } = useStore();
  const [cat, setCat] = useState<CategoryId>('consolas');
  const [photos, setPhotos] = useState<string[]>([]);
  const [ai, setAi] = useState<ConditionEstimate | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [condition, setCondition] = useState<Condition | undefined>();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [shipping, setShipping] = useState(true);
  const [selected, setSelected] = useState<PlatformId[]>(PLATFORMS_BY_CATEGORY.consolas);
  const [suggested, setSuggested] = useState<number | null>(null);
  const [step, setStep] = useState<'edit' | 'publish'>('edit');
  const [done, setDone] = useState<PlatformId[]>([]);
  const [copied, setCopied] = useState<PlatformId | null>(null);

  useEffect(() => setSelected(PLATFORMS_BY_CATEGORY[cat]), [cat]);

  // Precio recomendado a partir de anuncios parecidos
  useEffect(() => {
    if (title.trim().length < 4) return setSuggested(null);
    const id = setTimeout(async () => {
      const list = await searchAll(title);
      const prices = list.map((l) => l.price).sort((a, b) => a - b);
      setSuggested(prices.length ? prices[Math.floor(prices.length / 2)] : null);
    }, 600);
    return () => clearTimeout(id);
  }, [title]);

  async function addPhotos() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 8, quality: 0.7 });
    if (res.canceled) return;
    const next = [...photos, ...res.assets.map((a) => a.uri)].slice(0, 8);
    setPhotos(next);
    setAnalyzing(true);
    const est = await estimateCondition(next);
    setAi(est);
    setCondition((c) => c ?? est.condition);
    setAnalyzing(false);
  }

  const linked = (p: PlatformId) => Boolean(profile.accounts[p]?.linked);
  const targets = useMemo(() => selected, [selected]);
  const data = { title, price, desc, condition, shipping };
  const canPublish = title.trim() && price.trim() && targets.length > 0;

  const input = { borderWidth: 1, borderColor: t.line, backgroundColor: t.surface2, borderRadius: 10, padding: 12, color: t.ink, fontSize: 15 };
  const label = { color: t.ink, fontWeight: '600' as const, fontSize: 14 };

  if (step === 'publish') {
    return (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <Title size={22}>Publica “{title}”</Title>
        <Sub>
          Hemos adaptado el anuncio a cada web. Copia el texto, abre la web y pega. Cuando tengamos acuerdo con cada plataforma
          esto se hará solo.
        </Sub>
        {targets.map((p) => (
          <Box key={p}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: t.ink, fontWeight: '700', fontSize: 16 }}>{PLATFORMS[p].name}</Text>
              <Text style={{ color: done.includes(p) ? t.ok : t.muted, fontWeight: '600' }}>{done.includes(p) ? '✓ Hecho' : 'Pendiente'}</Text>
            </View>
            <Text style={{ color: t.muted, fontSize: 13 }} numberOfLines={4}>
              {adaptText(p, data)}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                style={{ flex: 1 }}
                variant="ghost"
                label={copied === p ? 'Copiado ✓' : 'Copiar texto'}
                onPress={async () => (await copyText(adaptText(p, data))) && setCopied(p)}
              />
              <Button
                style={{ flex: 1 }}
                label={`Abrir ${PLATFORMS[p].name}`}
                href={PLATFORMS[p].sellUrl}
                onPress={() => setDone((d) => (d.includes(p) ? d : [...d, p]))}
              />
            </View>
          </Box>
        ))}
        <Button label="Volver a editar" variant="ghost" onPress={() => setStep('edit')} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14, maxWidth: 640, width: '100%', alignSelf: 'center' }} keyboardShouldPersistTaps="handled">
      <View>
        <Title>Publica una vez, vende en todas</Title>
        <Sub>Gratis durante la beta. Elegimos las webs que más venden lo que ofreces.</Sub>
      </View>

      <Box>
        <Text style={label}>Fotos</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {photos.map((u) => (
            <Image key={u} source={u} style={{ width: 96, height: 96, borderRadius: 14 }} contentFit="cover" />
          ))}
          {photos.length < 8 && (
            <Pressable
              onPress={addPhotos}
              accessibilityRole="button"
              accessibilityLabel="Añadir fotos"
              style={{ width: 96, height: 96, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', borderColor: t.ember, backgroundColor: t.emberSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: t.ember, fontSize: 28, fontWeight: '800' }}>＋</Text>
              <Text style={{ color: t.ember, fontSize: 11, fontWeight: '700' }}>Añadir fotos</Text>
            </Pressable>
          )}
        </View>
        {analyzing && <Note>🤖 Analizando las fotos para estimar el estado…</Note>}
        {ai && !analyzing && (
          <Note>
            🤖 Estado estimado por IA: {CONDITIONS[ai.condition].label} ({ai.confidence} % de confianza). {ai.reason}
          </Note>
        )}

        <Text style={label}>¿Qué quieres vender?</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {(Object.keys(CATEGORIES) as CategoryId[]).map((k) => (
            <Chip key={k} label={`${CATEGORIES[k].emoji} ${CATEGORIES[k].name}`} active={cat === k} onPress={() => setCat(k)} />
          ))}
        </View>

        <Text style={label}>Estado</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {(Object.keys(CONDITIONS) as Condition[]).map((c) => (
            <Chip key={c} label={CONDITIONS[c].label} active={condition === c} onPress={() => setCondition(c)} />
          ))}
        </View>

        <Text style={label}>Título</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="Ej.: Nintendo Switch OLED con 2 mandos" placeholderTextColor={t.muted} style={input} />

        <Text style={label}>Precio</Text>
        <TextInput value={price} onChangeText={(v) => setPrice(v.replace(/\D/g, ''))} placeholder="€" placeholderTextColor={t.muted} keyboardType="numeric" style={input} />
        {suggested != null && (
          <Pressable onPress={() => setPrice(String(suggested))}>
            <Note>💡 Anuncios parecidos se venden por unos {euros(suggested)}. Toca para usar este precio.</Note>
          </Pressable>
        )}

        <Text style={label}>Entrega</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Chip label="Envío y en mano" active={shipping} onPress={() => setShipping(true)} />
          <Chip label="Solo en mano" active={!shipping} onPress={() => setShipping(false)} />
        </View>

        <Text style={label}>Descripción</Text>
        <TextInput
          value={desc}
          onChangeText={setDesc}
          placeholder="Estado, accesorios, motivo de venta…"
          placeholderTextColor={t.muted}
          multiline
          style={[input, { minHeight: 90, textAlignVertical: 'top' }]}
        />
      </Box>

      <Box>
        <View>
          <Text style={label}>Se publicará en</Text>
          <Sub>Las más usadas para {CATEGORIES[cat].name.toLowerCase()} en España</Sub>
        </View>
        {PLATFORMS_BY_CATEGORY[cat].map((p) => {
          const on = selected.includes(p);
          return (
            <Pressable
              key={p}
              onPress={() => setSelected((s) => (on ? s.filter((x) => x !== p) : [...s, p]))}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              style={{ flexDirection: 'row', gap: 10, alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: on ? t.ember : t.line }}>
              <Text style={{ fontSize: 18, color: on ? t.ember : t.muted }}>{on ? '☑' : '☐'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.ink, fontWeight: '700' }}>{PLATFORMS[p].name}</Text>
                <Text style={{ color: t.muted, fontSize: 12 }}>{linked(p) ? 'Cuenta vinculada' : 'Sin vincular. Puedes vincularla en Mi perfil'}</Text>
              </View>
            </Pressable>
          );
        })}
      </Box>

      {condition && <View style={{ alignSelf: 'flex-start' }}><ConditionBadge condition={condition} byAI={ai?.condition === condition} /></View>}
      <Button label={`Preparar en ${targets.length} plataformas`} disabled={!canPublish} onPress={() => setStep('publish')} />
      {!canPublish && <Sub>Añade un título, un precio y al menos una plataforma.</Sub>}
      <Button label="Ver mi perfil" variant="ghost" onPress={() => router.navigate('/profile')} />
    </ScrollView>
  );
}
