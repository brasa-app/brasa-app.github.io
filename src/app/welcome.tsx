import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { BrasaMark } from '@/components/brasa-logo';
import { Button, Chip, Sub, Title } from '@/components/ui';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

const CITIES = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Bilbao', 'Murcia', 'Palma', 'Otra'];
const POINTS: [string, string, string][] = [
  ['🔥', 'Chollos de todas las webs', 'Wallapop, Vinted, Milanuncios, eBay y más en un solo sitio.'],
  ['🛡', 'Sin estafas', 'Comprobamos al vendedor y ocultamos los anuncios sospechosos.'],
  ['⭐', 'Lo mejor por tu dinero', 'Te enseñamos el más barato y el de mejor estado/precio.'],
  ['🚀', 'Vende en todas a la vez', 'Sube tu producto una vez y publícalo en las webs que más venden.'],
];

export default function Welcome() {
  const t = useTheme();
  const { finishOnboarding, city: saved } = useStore();
  const [city, setCity] = useState(saved);

  return (
    <ScrollView contentContainerStyle={{ padding: 22, gap: 22, maxWidth: 520, width: '100%', alignSelf: 'center' }}>
      <View style={{ alignItems: 'center', gap: 10, marginTop: 10 }}>
        <BrasaMark size={64} />
        <Title size={30}>Bienvenido a Brasa</Title>
        <Sub>La forma más rápida de comprar y vender de segunda mano.</Sub>
      </View>
      <View style={{ gap: 14 }}>
        {POINTS.map(([e, h, d]) => (
          <View key={h} style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: t.emberSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 22 }}>{e}</Text>
            </View>
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
