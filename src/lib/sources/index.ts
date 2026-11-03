import type { Listing } from '../types';
import { ebaySource } from './ebay';
import { mockSource } from './mock';
import type { ListingSource } from './types';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

const sources: ListingSource[] = [ebaySource, ...(USE_MOCK ? [mockSource] : [])].filter((s) => s.enabled);

/** Caché en memoria para abrir el detalle de cualquier anuncio ya mostrado. */
const cache = new Map<string, Listing>();
export const getListing = (id: string) => cache.get(id);
export const rememberListings = (list: Listing[]) => list.forEach((l) => cache.set(l.id, l));

async function fromAll(fn: (s: ListingSource) => Promise<Listing[]>): Promise<Listing[]> {
  const results = await Promise.allSettled(sources.map(fn));
  const list = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  rememberListings(list);
  return list;
}

export const searchAll = (q: string) => fromAll((s) => s.search(q));
export const trendingAll = () => fromAll((s) => s.trending());
