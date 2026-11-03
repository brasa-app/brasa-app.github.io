import type { Listing } from '../types';
import type { ListingSource } from './types';

/**
 * eBay Browse API (oficial). Las claves de eBay no pueden ir dentro de la app,
 * así que la app llama a nuestro propio servidor (EXPO_PUBLIC_API_URL), que habla con eBay
 * y añade el enlace de afiliado de eBay Partner Network.
 *
 * Respuesta esperada del servidor: { items: Listing[] }
 */
const API = process.env.EXPO_PUBLIC_API_URL;

async function get(path: string): Promise<Listing[]> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`eBay ${res.status}`);
  const body = (await res.json()) as { items: Listing[] };
  return body.items;
}

export const ebaySource: ListingSource = {
  id: 'ebay',
  enabled: Boolean(API),
  search: (q) => get(`/ebay/search?q=${encodeURIComponent(q)}`),
  trending: () => get('/ebay/trending'),
};
