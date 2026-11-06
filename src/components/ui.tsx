import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Linking, Platform, Pressable, Share, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

/** Abre una web externa. En web se usa un enlace real para que funcione en cualquier navegador. */
export const openExternal = (url: string) => {
  if (!isSafeUrl(url)) return;
  Linking.openURL(url).catch(() => {});
};

/** Solo se abren enlaces https. Bloquea javascript:, data:, file: y similares. */
export function isSafeUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    return u.protocol === 'https:' && !u.username && !u.password && u.hostname.includes('.');
  } catch {
    return false;
  }
}

/** Copia un texto: portapapeles en web, menú de compartir en el móvil. */
export async function copyText(text: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
  await Share.share({ message: text }).catch(() => {});
  return true;
}

import { CONDITIONS } from '@/lib/platforms';
import { trustLevel } from '@/lib/scoring';
import { font, radius, useTheme } from '@/lib/theme';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];
import type { Condition } from '@/lib/types';

export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress?: () => void; icon?: IconName }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [styles.chip, { borderColor: active ? t.ink : t.line, backgroundColor: active ? t.ink : t.bg, opacity: pressed ? 0.7 : 1 }]}>
      {icon && <Ionicons name={icon} size={14} color={active ? t.bg : t.ink} />}
      <Text style={{ color: active ? t.bg : t.ink, fontSize: 13, fontWeight: '600' }}>{label}</Text>
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
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      <Ionicons name="shield-checkmark" size={12} color={color} />
      <Text style={{ color, fontWeight: '700', fontSize: 12 }}>{score}</Text>
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
  href,
}: {
  /** Enlace externo: en web se pinta como <a target=_blank> */
  href?: string;
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
      onPress={
        href
          ? () => {
              openExternal(href);
              onPress?.();
            }
          : onPress
      }
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.btn,
        primary ? { backgroundColor: t.ember } : { backgroundColor: t.bg, borderWidth: 1, borderColor: t.line },
        { opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}>
      <Text style={{ color: primary ? t.emberInk : t.ink, fontWeight: '700', fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

export function Box({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return <View style={[styles.box, { borderColor: t.line }, style]}>{children}</View>;
}

export function Title({ children, size = 26 }: { children: ReactNode; size?: number }) {
  const t = useTheme();
  return <Text style={{ color: t.ink, fontSize: size, fontFamily: font.heavy, fontWeight: '800', letterSpacing: -size * 0.02 }}>{children}</Text>;
}

/** Cabecera de sección: etiqueta pequeña en mayúsculas, titular y acción opcional a la derecha. */
export function Section({ kicker, title, action, onAction }: { kicker?: string; title: string; action?: string; onAction?: () => void }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
      <View style={{ flex: 1, gap: 2 }}>
        {kicker && <Text style={{ color: t.ember, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' }}>{kicker}</Text>}
        <Title size={21}>{title}</Title>
      </View>
      {action && (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
          <Text style={{ color: t.ink, fontWeight: '600', fontSize: 13, textDecorationLine: 'underline' }}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function Sub({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={{ color: t.muted, fontSize: 13, lineHeight: 18 }}>{children}</Text>;
}

export function Note({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'bad' }) {
  const t = useTheme();
  return (
    <View style={{ borderLeftWidth: 3, borderLeftColor: tone === 'bad' ? t.bad : t.ember, backgroundColor: tone === 'bad' ? t.badSoft : t.surface2, borderRadius: 4, paddingVertical: 10, paddingHorizontal: 12 }}>
      <Text style={{ color: tone === 'bad' ? t.bad : t.ink, fontSize: 13, lineHeight: 19 }}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  badge: { fontSize: 11, fontWeight: '700', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, overflow: 'hidden' },
  ai: { fontSize: 10, fontWeight: '700', borderWidth: 1, borderStyle: 'dashed', borderRadius: 4, paddingHorizontal: 4 },
  btn: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center' },
  box: { borderTopWidth: 1, paddingTop: 18, paddingBottom: 6, gap: 12 },
});
