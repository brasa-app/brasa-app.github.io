import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { BrasaMark } from '@/components/brasa-logo';
import { Button, Chip, Sub, Title } from '@/components/ui';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

const CITIES = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Bilbao', 'Murcia', 'Palma', 'Otra'];
const POINTS: [React.ComponentProps<typeof Ionicons>['name'], string, string][] = [
  ['albums-outline', 'Chollos de todas las webs', 'Wallapop, Vinted, Milanuncios, eBay y más en un solo sitio.'],
  ['shield-checkmark-outline', 'Sin estafas', 'Comprobamos al vendedor y ocultamos los anuncios sospechosos.'],
  ['pricetag-outline', 'Lo mejor por tu dinero', 'Te enseñamos el más barato y el de mejor estado/precio.'],
  ['paper-plane-outline', 'Vende en todas a la vez', 'Sube tu producto una vez y publícalo en las webs que más venden.'],
];

export default function Welcome() {
  const t = useTheme();
  const { finishOnboarding, city: saved } = useStore();
  const [city, setCity] = useState(saved);

  return (
    <ScrollView contentContainerStyle={{ padding: 22, gap: 22, maxWidth: 520, width: '100%', alignSelf: 'center' }}>
      <View style={{ gap: 14, marginTop: 24 }}>
        <BrasaMark size={44} />
        <Title size={34}>Toda la segunda mano, en un solo sitio.</Title>
        <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21 }}>Busca una vez y compara Wallapop, Vinted, Milanuncios y más. La compra se hace siempre en la web del anuncio.</Text>
      </View>
      <View style={{ borderTopWidth: 1, borderColor: t.line }}>
        {POINTS.map(([e, h, d]) => (
          <View key={h} style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start', paddingVertical: 14, borderBottomWidth: 1, borderColor: t.line }}>
            <Ionicons name={e} size={22} color={t.ink} style={{ marginTop: 1 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.ink, fontWeight: '700', fontSize: 15 }}>{h}</Text>
              <Sub>{d}</Sub>
            </View>
          </View>
        ))}
      </View>
      <View style={{ gap: 10 }}>
        <Text style={{ color: t.ink, fontWeight: '700', fontSize: 15 }}>¿Dónde estás?</Text>
        <Sub>Lo usamos para enseñarte chollos cerca de ti.</Sub>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {CITIES.map((c) => <Chip key={c} label={c} active={city === c} onPress={() => setCity(c)} />)}
        </View>
      </View>
      <Button
        label="Empezar"
        onPress={() => {
          finishOnboarding(city);
          router.back();
        }}
      />
    </ScrollView>
  );
}
