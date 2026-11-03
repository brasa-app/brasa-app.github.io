import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { CONDITIONS } from '@/lib/platforms';
import { trustLevel } from '@/lib/scoring';
import { radius, useTheme } from '@/lib/theme';
import type { Condition } from '@/lib/types';

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, { borderColor: active ? t.ink : t.line, backgroundColor: active ? t.ink : t.surface }]}>
      <Text style={{ color: active ? t.bg : t.ink, fontSize: 13, fontWeight: '500' }}>{label}</Text>
    </Pressable>
  );
}

export function ConditionBadge({ condition, byAI }: { condition: Condition; byAI?: boolean }) {
  const t = useTheme();
  const map = {
    mb: [t.okSoft, t.ok],
    b: ['transparent', t.ok],
    r: [t.warnSoft, t.warn],
    ar: [t.badSoft, t.bad],
  } as const;
  const [bg, fg] = map[condition];
  return (
    <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
      <Text style={[styles.badge, { backgroundColor: bg, color: fg, borderColor: fg, borderWidth: condition === 'b' ? 1 : 0 }]}>
        {CONDITIONS[condition].label}
      </Text>
      {byAI && <Text style={[styles.ai, { color: t.night, borderColor: t.muted }]}>IA</Text>}
    </View>
  );
}

export function TrustPill({ score }: { score: number }) {
  const t = useTheme();
  const color = { ok: t.ok, warn: t.warn, bad: t.bad }[trustLevel(score)];
  return <Text style={{ color, fontWeight: '700', fontSize: 12 }}>🛡 {score}</Text>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: primary ? t.ember : t.surface2, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}>
      <Text style={{ color: primary ? t.emberInk : t.ink, fontWeight: '700', fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

export function Box({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return <View style={[styles.box, { backgroundColor: t.surface, borderColor: t.line }, style]}>{children}</View>;
}

export function Title({ children, size = 26 }: { children: ReactNode; size?: number }) {
  const t = useTheme();
  return <Text style={{ color: t.ink, fontSize: size, fontWeight: '800', letterSpacing: -0.3 }}>{children}</Text>;
}

export function Sub({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={{ color: t.muted, fontSize: 13, lineHeight: 18 }}>{children}</Text>;
}

export function Note({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'bad' }) {
  const t = useTheme();
  return (
    <View style={{ backgroundColor: tone === 'bad' ? t.badSoft : t.surface2, borderRadius: 10, padding: 12 }}>
      <Text style={{ color: tone === 'bad' ? t.bad : t.muted, fontSize: 13, lineHeight: 18 }}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  badge: { fontSize: 11, fontWeight: '700', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, overflow: 'hidden' },
  ai: { fontSize: 10, fontWeight: '700', borderWidth: 1, borderStyle: 'dashed', borderRadius: 4, paddingHorizontal: 4 },
  btn: { borderRadius: 999, paddingVertical: 13, paddingHorizontal: 18, alignItems: 'center' },
  box: { borderRadius: radius, borderWidth: 1, padding: 14, gap: 12 },
});
