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

export type ScreenshotAnalysis = {
  title: string;
  price: number;
  marketPrice: number;
  platform: string;
  sellerName: string;
  accountAgeMonths: number;
  reviews: number;
  stars: number;
  verifications: string[];
  warnings: string[];
};

/**
 * Lee una captura de un anuncio (de cualquier app) y extrae precio, vendedor y señales de estafa.
 * En producción lo hace un modelo de visión en nuestro servidor. Sin servidor devuelve un ejemplo.
 */
export async function analyzeScreenshot(uri: string): Promise<ScreenshotAnalysis> {
  if (API) {
    const res = await fetch(`${API}/ai/screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: uri }),
    });
    if (res.ok) return (await res.json()) as ScreenshotAnalysis;
  }
  await new Promise((r) => setTimeout(r, 1500));
  return {
    title: 'iPhone 14 Pro 256 GB (ejemplo)',
    price: 290,
    marketPrice: 690,
    platform: 'Wallapop',
    sellerName: 'user_5521',
    accountAgeMonths: 0.5,
    reviews: 0,
    stars: 0,
    verifications: ['Email'],
    warnings: ['Pide hablar por WhatsApp', 'Precio muy por debajo del mercado', 'Fotos encontradas en otros anuncios'],
  };
}
