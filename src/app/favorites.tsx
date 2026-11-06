import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';

import { ListingRow } from '@/components/listing-card';
import { Box, Button, Sub, Title } from '@/components/ui';
import { rememberListings } from '@/lib/sources';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

export default function Favorites() {
  const t = useTheme();
  const { favorites, favoriteItems, savedSearches, removeSearch } = useStore();
  const items = favorites.map((id) => favoriteItems[id]).filter(Boolean);
  rememberListings(items);

  return (
    <FlatList
      data={items}
      keyExtractor={(l) => l.id}
      contentContainerStyle={{ padding: 16, gap: 10, maxWidth: 720, width: '100%', alignSelf: 'center' }}
      ListHeaderComponent={
        <View style={{ gap: 14, marginBottom: 4 }}>
          <Box>
            <Text style={{ color: t.ink, fontWeight: '700', fontSize: 16 }}>Alertas</Text>
            {savedSearches.length ? (
              savedSearches.map((s) => (
                <View key={s.query} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Pressable onPress={() => router.push({ pathname: '/search', params: { q: s.query } })}>
                    <Text style={{ color: t.ink, fontSize: 15 }}>{s.query}</Text>
                  </Pressable>
                  <Pressable onPress={() => removeSearch(s.query)} hitSlop={8}>
                    <Text style={{ color: t.bad, fontWeight: '600' }}>Quitar</Text>
                  </Pressable>
                </View>
              ))
            ) : (
              <Sub>Busca algo y pulsa "Crear alerta" para que te avisemos cuando salga un chollo.</Sub>
            )}
          </Box>
          <Title size={20}>Favoritos</Title>
        </View>
      }
      ListEmptyComponent={
        <View style={{ alignItems: 'center', gap: 10, padding: 24 }}>
          <Ionicons name="heart-outline" size={36} color={t.muted} />
          <Sub>Toca el corazón de cualquier anuncio para guardarlo aquí.</Sub>
          <Button label="Ver ofertas" variant="ghost" onPress={() => router.navigate('/')} />
        </View>
      }
      renderItem={({ item }) => <ListingRow l={item} />}
    />
  );
}
