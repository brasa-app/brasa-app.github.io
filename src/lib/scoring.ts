import { CONDITIONS } from './platforms';
import type { Filters, Listing } from './types';

/** Precio esperado según el estado: un producto "a reparar" vale menos que uno "muy bueno". */
export const expectedPrice = (l: Listing) => l.marketPrice * CONDITIONS[l.condition].factor;

export type Check = { label: string; value: string; level: 'ok' | 'warn' | 'bad' };

/** Señales de fiabilidad del vendedor y del anuncio. */
export function trustChecks(l: Listing): Check[] {
  const s = l.seller;
  const ratio = l.price / expectedPrice(l);
  const scamPattern = s.accountAgeMonths < 1 && ratio < 0.6;
  return [
    {
      label: 'Antigüedad de la cuenta',
      value: s.accountAgeMonths >= 1 ? `${Math.round(s.accountAgeMonths)} meses` : 'menos de 1 mes',
      level: s.accountAgeMonths >= 12 ? 'ok' : s.accountAgeMonths >= 3 ? 'warn' : 'bad',
    },
    { label: 'Reseñas recibidas', value: String(s.reviews), level: s.reviews >= 20 ? 'ok' : s.reviews >= 5 ? 'warn' : 'bad' },
    {
      label: 'Valoración media',
      value: s.stars ? `${s.stars.toFixed(1)} ★` : 'sin valorar',
      level: s.stars >= 4.5 ? 'ok' : s.stars >= 4 ? 'warn' : 'bad',
    },
    {
      label: 'Verificaciones',
      value: s.verifications.join(', ') || 'ninguna',
      level: s.verifications.length >= 2 ? 'ok' : s.verifications.length ? 'warn' : 'bad',
    },
    {
      label: 'Precio frente a su estado',
      value: `${Math.round(ratio * 100)} %`,
      level: ratio >= 0.5 ? 'ok' : ratio >= 0.35 ? 'warn' : 'bad',
    },
    { label: 'Patrones de estafa conocidos', value: scamPattern ? 'detectados' : 'ninguno', level: scamPattern ? 'bad' : 'ok' },
  ];
}

/** Índice de fiabilidad de 0 a 100. */
export function trustScore(l: Listing): number {
  const s = l.seller;
  let score = 30;
  score += Math.min(25, s.accountAgeMonths / 3);
  score += Math.min(20, s.reviews / 6);
  score += s.stars ? (s.stars - 3) * 10 : 0;
  score += s.verifications.length * 5;
  const ratio = l.price / expectedPrice(l);
  if (ratio < 0.4) score -= 25;
  if (s.accountAgeMonths < 1 && ratio < 0.6) score -= 20;
  return Math.max(3, Math.min(99, Math.round(score)));
}

export const trustLevel = (t: number) => (t >= 75 ? 'ok' : t >= 50 ? 'warn' : 'bad') as Check['level'];
export const isSafe = (l: Listing) => trustScore(l) >= 50;

/** Relación estado/precio: más alto es mejor. Penaliza vendedores poco fiables. */
export function valueScore(l: Listing): number {
  return CONDITIONS[l.condition].factor * (l.marketPrice / l.price) * (isSafe(l) ? 1 : 0.4);
}

/** "Está que arde": mezcla descuento, interés (visitas y favoritos) y novedad. */
export function heatScore(l: Listing, now = Date.now()): number {
  const discount = Math.max(0, 1 - l.price / expectedPrice(l));
  const minutes = (now - l.publishedAt) / 60000;
  const h = discount * 90 + Math.log10(Math.max(1, l.views)) * 6 + l.favorites / 40 - minutes / 5;
  return Math.max(0, Math.min(99, Math.round(h)));
}

export const discountPct = (l: Listing) => Math.round((1 - l.price / expectedPrice(l)) * 100);

export function passesFilters(l: Listing, f: Filters): boolean {
  if (!f.nationwide && l.distanceKm > f.radiusKm) return false;
  if (f.minPrice != null && l.price < f.minPrice) return false;
  if (f.maxPrice != null && l.price > f.maxPrice) return false;
  if (f.conditions.length && !f.conditions.includes(l.condition)) return false;
  if (f.delivery === 'shipping' && !l.shipping) return false;
  if (f.delivery === 'inPerson' && !l.inPerson) return false;
  if (f.category !== 'all' && l.category !== f.category) return false;
  return true;
}

export function activeFilterCount(f: Filters): number {
  return (
    (f.nationwide ? 0 : 1) +
    (f.minPrice != null || f.maxPrice != null ? 1 : 0) +
    (f.conditions.length ? 1 : 0) +
    (f.delivery !== 'any' ? 1 : 0)
  );
}

export function bestPicks(list: Listing[]) {
  const safe = list.filter(isSafe);
  const cheapest = [...safe].sort((a, b) => a.price - b.price)[0];
  const bestValue = [...safe].sort((a, b) => valueScore(b) - valueScore(a))[0];
  return { cheapest, bestValue };
}
