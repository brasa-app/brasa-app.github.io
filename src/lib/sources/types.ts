import type { Listing } from '../types';

/**
 * Una fuente de anuncios. Cada plataforma con acuerdo o API oficial
 * (eBay, feeds de afiliados, anuncios propios de Brasa) implementa esta interfaz.
 * Nunca se implementa copiando la web de una plataforma sin permiso.
 */
export interface ListingSource {
  id: string;
  enabled: boolean;
  search(query: string): Promise<Listing[]>;
  trending(): Promise<Listing[]>;
}
