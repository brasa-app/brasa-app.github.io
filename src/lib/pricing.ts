import { expectedPrice } from './scoring';
import type { Listing } from './types';

const round = (n: number) => (n > 2000 ? Math.round(n / 50) * 50 : n > 200 ? Math.round(n / 5) * 5 : Math.round(n));

/**
 * Oferta sugerida para regatear. Si el precio ya es un chollo, rebajar poco;
 * si está por encima de lo que vale según su estado, acercarlo a ese valor.
 */
export function suggestedOffer(l: Listing): { offer: number; note: string } {
  const fair = expectedPrice(l);
  if (l.price <= fair * 0.8) {
    return { offer: round(l.price * 0.95), note: 'Ya es un buen precio. Una rebaja pequeña tiene más opciones de ser aceptada.' };
  }
  if (l.price <= fair) {
    return { offer: round(l.price * 0.9), note: 'Precio correcto. Un 10 % menos suele aceptarse en segunda mano.' };
  }
  return { offer: round(Math.max(fair, l.price * 0.8)), note: 'Está por encima de lo que vale en su estado. Ofrece cerca del precio justo.' };
}

/** Precio medio de las últimas 8 semanas (datos de ejemplo hasta tener histórico real). */
export function priceHistory(l: Listing): { week: string; price: number }[] {
  let s = [...l.title].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 2147483647, 7);
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const out = [];
  let p = l.marketPrice * (1.08 + rand() * 0.1);
  for (let i = 7; i >= 0; i--) {
    out.push({ week: i === 0 ? 'Hoy' : `-${i} sem`, price: round(p) });
    p *= 0.97 + rand() * 0.04;
  }
  return out;
}
