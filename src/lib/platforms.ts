import type { CategoryId, Condition, PlatformId } from './types';

export const PLATFORMS: Record<PlatformId, { name: string; home: string; sellUrl: string }> = {
  // Las URLs de "vender" son las páginas de subida de cada web. Revisarlas antes del lanzamiento.
  wallapop: { name: 'Wallapop', home: 'https://es.wallapop.com', sellUrl: 'https://es.wallapop.com/app/catalog/upload' },
  vinted: { name: 'Vinted', home: 'https://www.vinted.es', sellUrl: 'https://www.vinted.es/items/new' },
  milanuncios: { name: 'Milanuncios', home: 'https://www.milanuncios.com', sellUrl: 'https://www.milanuncios.com/publicar-anuncios-gratis/' },
  cochesnet: { name: 'coches.net', home: 'https://www.coches.net', sellUrl: 'https://www.coches.net/vender-coche/' },
  motosnet: { name: 'motos.net', home: 'https://motos.coches.net', sellUrl: 'https://motos.coches.net/vender-moto/' },
  ebay: { name: 'eBay', home: 'https://www.ebay.es', sellUrl: 'https://www.ebay.es/sl/sell' },
  todocoleccion: { name: 'Todocoleccion', home: 'https://www.todocoleccion.net', sellUrl: 'https://www.todocoleccion.net/vender' },
  autoscout: { name: 'AutoScout24', home: 'https://www.autoscout24.es', sellUrl: 'https://www.autoscout24.es/vender-coche/' },
  brasa: { name: 'Brasa', home: '', sellUrl: '' },
};

/** Página de búsqueda de cada plataforma para un producto. */
export function searchUrl(p: PlatformId, q: string): string {
  const e = encodeURIComponent(q);
  switch (p) {
    case 'wallapop': return `https://es.wallapop.com/app/search?keywords=${e}`;
    case 'vinted': return `https://www.vinted.es/catalog?search_text=${e}`;
    case 'milanuncios': return `https://www.milanuncios.com/anuncios/?s=${e}`;
    case 'ebay': return `https://www.ebay.es/sch/i.html?_nkw=${e}`;
    case 'cochesnet': return `https://www.coches.net/segunda-mano/?KeyWords=${e}`;
    case 'motosnet': return `https://motos.coches.net/segunda-mano/?KeyWords=${e}`;
    case 'todocoleccion': return `https://www.todocoleccion.net/buscador?bu=${e}`;
    default: return PLATFORMS[p].home;
  }
}

export const CATEGORIES: Record<CategoryId, { name: string; emoji: string }> = {
  moviles: { name: 'Móviles', emoji: '📱' },
  consolas: { name: 'Videojuegos', emoji: '🎮' },
  moda: { name: 'Moda', emoji: '👟' },
  motor: { name: 'Coches', emoji: '🚗' },
  motos: { name: 'Motos', emoji: '🏍️' },
  bici: { name: 'Bicis y patinetes', emoji: '🚲' },
  hogar: { name: 'Hogar', emoji: '🛋️' },
  foto: { name: 'Fotografía', emoji: '📷' },
  info: { name: 'Informática', emoji: '💻' },
  colec: { name: 'Coleccionismo', emoji: '🃏' },
};

/** Plataformas donde más se vende cada categoría en España, por orden. */
export const PLATFORMS_BY_CATEGORY: Record<CategoryId, PlatformId[]> = {
  moviles: ['wallapop', 'milanuncios', 'vinted', 'ebay'],
  consolas: ['wallapop', 'vinted', 'milanuncios', 'ebay'],
  moda: ['vinted', 'wallapop', 'milanuncios'],
  motor: ['cochesnet', 'milanuncios', 'wallapop', 'autoscout'],
  motos: ['motosnet', 'milanuncios', 'wallapop'],
  bici: ['wallapop', 'milanuncios', 'ebay'],
  hogar: ['wallapop', 'milanuncios', 'vinted'],
  foto: ['wallapop', 'ebay', 'milanuncios'],
  info: ['wallapop', 'milanuncios', 'ebay', 'vinted'],
  colec: ['todocoleccion', 'wallapop', 'vinted', 'ebay'],
};

export const CONDITIONS: Record<Condition, { label: string; factor: number }> = {
  mb: { label: 'Muy bueno', factor: 1 },
  b: { label: 'Bueno', factor: 0.82 },
  r: { label: 'Regular', factor: 0.6 },
  ar: { label: 'A reparar', factor: 0.33 },
};

export const euros = (n: number) => `${n.toLocaleString('es-ES', { maximumFractionDigits: 0 })} €`;
