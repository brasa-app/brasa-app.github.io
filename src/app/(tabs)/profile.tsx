import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Box, Button, Note, Sub, Title, copyText } from '@/components/ui';
import { router } from 'expo-router';
import { PLATFORMS } from '@/lib/platforms';
import { useStore, type LinkedAccount } from '@/lib/store';
import { useTheme } from '@/lib/theme';
import type { PlatformId } from '@/lib/types';

export default function Profile() {
  const t = useTheme();
  const { profile, setProfile, favorites, savedSearches, removeSearch, resetAll } = useStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [exported, setExported] = useState(false);
  const store = useStore();
  const exportData = () =>
    JSON.stringify({ perfil: store.profile, ciudad: store.city, favoritos: store.favorites, alertas: store.savedSearches, chollosCompartidos: store.deals.filter((d) => !d.example) }, null, 2);
  const [editing, setEditing] = useState<PlatformId | null>(null);
  const [stars, setStars] = useState('');
  const [reviews, setReviews] = useState('');

  const accounts = Object.entries(profile.accounts) as [PlatformId, LinkedAccount][];
  const linked = accounts.filter(([, a]) => a.linked);
  const totalReviews = linked.reduce((s, [, a]) => s + a.reviews, 0);
  const avg = totalReviews ? linked.reduce((s, [, a]) => s + a.stars * a.reviews, 0) / totalReviews : 0;

  const input = { borderWidth: 1, borderColor: t.line, backgroundColor: t.surface2, borderRadius: 10, padding: 12, color: t.ink, fontSize: 15 };
  const label = { color: t.ink, fontWeight: '600' as const, fontSize: 14 };

  async function pickPhoto() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!res.canceled) setProfile({ ...profile, photoUri: res.assets[0].uri });
  }

  function saveAccount(p: PlatformId) {
    const s = Math.min(5, Math.max(0, Number(stars.replace(',', '.')) || 0));
    const r = Math.max(0, Number(reviews.replace(/\D/g, '')) || 0);
    setProfile({ ...profile, accounts: { ...profile.accounts, [p]: { linked: true, stars: s, reviews: r } } });
    setEditing(null);
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14, maxWidth: 640, width: '100%', alignSelf: 'center' }} keyboardShouldPersistTaps="handled">
      <Box style={{ alignItems: 'center' }}>
        <Pressable onPress={pickPhoto} accessibilityRole="button" accessibilityLabel="Cambiar foto de perfil"
          style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: t.emberSoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {profile.photoUri ? (
            <Image source={profile.photoUri} style={{ width: 88, height: 88 }} contentFit="cover" />
          ) : (
            <Text style={{ color: t.ember, fontSize: 32, fontWeight: '800' }}>{profile.name.charAt(0) || '?'}</Text>
          )}
        </Pressable>
        <TextInput value={profile.name} onChangeText={(name) => setProfile({ ...profile, name })}
          style={{ color: t.ink, fontSize: 22, fontWeight: '800', textAlign: 'center' }} />
        <Sub>Toca la foto para cambiarla</Sub>
        <View style={{ flexDirection: 'row', gap: 8, alignSelf: 'stretch' }}>
          {[
            [avg ? avg.toFixed(1) : '—', 'Media global'],
            [String(totalReviews), 'Reseñas'],
            [String(linked.length), 'Apps vinculadas'],
          ].map(([v, k]) => (
            <View key={k} style={{ flex: 1, backgroundColor: t.surface2, borderRadius: 10, padding: 10, alignItems: 'center' }}>
              <Text style={{ color: t.ink, fontSize: 20, fontWeight: '800' }}>{v}</Text>
              <Text style={{ color: t.muted, fontSize: 11.5 }}>{k}</Text>
            </View>
          ))}
        </View>
      </Box>

      <Box>
        <Text style={label}>Descripción</Text>
        <TextInput value={profile.bio} onChangeText={(bio) => setProfile({ ...profile, bio })} multiline style={[input, { minHeight: 70, textAlignVertical: 'top' }]} />
        <Text style={label}>Código postal</Text>
        <TextInput value={profile.address} onChangeText={(v) => setProfile({ ...profile, address: v.replace(/\D/g, '').slice(0, 5) })} placeholder="28013" placeholderTextColor={t.muted} keyboardType="number-pad" style={input} />
        <Sub>🔒 Solo pedimos tu código postal, nunca tu dirección exacta. Se guarda cifrado en tu dispositivo y no se muestra a nadie.</Sub>
      </Box>

      <Box>
        <Text style={label}>Cuentas vinculadas</Text>
        <Note>🔒 Brasa nunca te pedirá la contraseña de Wallapop, Vinted ni ninguna otra app. Si alguien te la pide en nombre de Brasa, es una estafa.</Note>
        <Sub>Añade tu valoración en cada app para mostrar tu media como vendedor. La verificaremos cuando la plataforma lo permita.</Sub>
        {accounts.map(([p, a]) => (
          <View key={p} style={{ gap: 8, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: t.line }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text>{a.linked ? '🟢' : '⚪'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.ink, fontWeight: '700' }}>{PLATFORMS[p].name}</Text>
                <Text style={{ color: t.muted, fontSize: 12 }}>{a.linked ? `★ ${a.stars.toFixed(1)} · ${a.reviews} reseñas` : 'No vinculada'}</Text>
              </View>
              <Button
                label={a.linked ? 'Desvincular' : 'Vincular'}
                variant={a.linked ? 'ghost' : 'primary'}
                style={{ paddingVertical: 8 }}
                onPress={() => {
                  if (a.linked) setProfile({ ...profile, accounts: { ...profile.accounts, [p]: { linked: false, stars: 0, reviews: 0 } } });
                  else {
                    setEditing(p);
                    setStars('');
                    setReviews('');
                  }
                }}
              />
            </View>
            {editing === p && (
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput value={stars} onChangeText={setStars} placeholder="Valoración (0-5)" placeholderTextColor={t.muted} keyboardType="decimal-pad" style={[input, { flex: 1 }]} />
                  <TextInput value={reviews} onChangeText={setReviews} placeholder="Nº de reseñas" placeholderTextColor={t.muted} keyboardType="numeric" style={[input, { flex: 1 }]} />
                </View>
                <Button label="Guardar" onPress={() => saveAccount(p)} />
              </View>
            )}
          </View>
        ))}
      </Box>

      <Box>
        <Text style={label}>Alertas de búsqueda</Text>
        {savedSearches.length ? (
          savedSearches.map((s) => (
            <View key={s.query} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: t.ink }}>🔔 {s.query}</Text>
              <Pressable onPress={() => removeSearch(s.query)}><Text style={{ color: t.bad, fontWeight: '600' }}>Quitar</Text></Pressable>
            </View>
          ))
        ) : (
          <Sub>Crea una alerta desde el buscador y te avisaremos cuando salga un chollo.</Sub>
        )}
        <Button variant="ghost" label={`♥ Ver mis ${favorites.length} favoritos`} onPress={() => router.push('/favorites')} />
      </Box>

      <Box>
        <Text style={label}>Privacidad</Text>
        <Sub>🔒 Tus datos están cifrados en tu dispositivo. No usamos analíticas, publicidad ni rastreadores, y no vendemos datos a nadie.</Sub>
        <Button variant="ghost" label={exported ? 'Datos copiados ✓' : 'Copiar mis datos (exportar)'} onPress={async () => setExported(await copyText(exportData()))} />
        <Button variant="ghost" label="Privacidad y aviso legal" onPress={() => router.push('/legal')} />
        {!confirmDelete ? (
          <Button variant="ghost" label="Borrar mi cuenta y mis datos" onPress={() => setConfirmDelete(true)} />
        ) : (
          <View style={{ gap: 10 }}>
            <Note tone="bad">Se borrarán tu perfil, favoritos, alertas y cuentas vinculadas. No se puede deshacer.</Note>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button style={{ flex: 1 }} variant="ghost" label="Cancelar" onPress={() => setConfirmDelete(false)} />
              <Button style={{ flex: 1 }} label="Borrar todo" onPress={() => { resetAll(); setConfirmDelete(false); }} />
            </View>
          </View>
        )}
      </Box>

      <Title size={14}>Brasa · versión beta</Title>
    </ScrollView>
  );
}
