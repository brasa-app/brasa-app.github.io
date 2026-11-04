import { Text, View } from 'react-native';

import { useTheme } from '@/lib/theme';

/** Brasa: una gota de fuego (llama exterior naranja, núcleo amarillo) + el nombre en minúsculas muy gruesas. */
export function BrasaMark({ size = 28 }: { size?: number }) {
  const inner = size * 0.46;
  const drop = (s: number) => ({ width: s, height: s, borderRadius: s / 2, borderTopRightRadius: s * 0.08, transform: [{ rotate: '-45deg' }] });
  return (
    <View style={{ width: size, height: size * 1.12, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View style={[drop(size * 0.86), { backgroundColor: '#e8501f', position: 'absolute', bottom: 0 }]} />
      <View style={[drop(inner), { backgroundColor: '#ffc23d', position: 'absolute', bottom: size * 0.1 }]} />
    </View>
  );
}

export function BrasaLogo({ size = 26 }: { size?: number }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }} accessibilityRole="header" accessibilityLabel="Brasa">
      <BrasaMark size={size * 1.05} />
      <Text style={{ fontSize: size, fontWeight: '900', letterSpacing: -size * 0.05, color: t.ink, includeFontPadding: false }}>
        bras<Text style={{ color: t.ember }}>a</Text>
      </Text>
    </View>
  );
}
