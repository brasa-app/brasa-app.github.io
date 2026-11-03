import type { Condition } from './types';

export type ConditionEstimate = { condition: Condition; confidence: number; reason: string };

const API = process.env.EXPO_PUBLIC_API_URL;

const REASONS: Record<Condition, string> = {
  mb: 'Sin arañazos ni marcas visibles. Parece conservar caja y accesorios.',
  b: 'Pequeñas marcas de uso en bordes y superficie, sin daños visibles.',
  r: 'Desgaste evidente y algún golpe. Conviene indicarlo en la descripción.',
  ar: 'Se aprecian daños que pueden afectar al funcionamiento.',
};

/**
 * Estima el estado del producto a partir de sus fotos.
 * En producción, el servidor envía las fotos a un modelo de visión y devuelve el estado.
 * Sin servidor configurado devuelve una estimación de ejemplo.
 */
export async function estimateCondition(photoUris: string[]): Promise<ConditionEstimate> {
  if (API) {
    const res = await fetch(`${API}/ai/condition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos: photoUris }),
    });
    if (res.ok) return (await res.json()) as ConditionEstimate;
  }
  await new Promise((r) => setTimeout(r, 1200));
  const options: Condition[] = ['mb', 'b', 'b', 'r'];
  const condition = options[photoUris.length % options.length];
  return { condition, confidence: 80 + (photoUris.length % 15), reason: REASONS[condition] };
}
