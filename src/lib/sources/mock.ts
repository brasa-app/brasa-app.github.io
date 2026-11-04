import { PLATFORMS, PLATFORMS_BY_CATEGORY, CONDITIONS } from '../platforms';
import { tints } from '../theme';
import type { CategoryId, Condition, Listing, PlatformId, Seller } from '../types';
import { PRODUCT_IMAGES } from './product-images';
import type { ListingSource } from './types';

/** Datos de ejemplo para desarrollar la app sin depender de ninguna API. */

const SELLERS: Seller[] = [
  { name: 'Lucía M.', accountAgeMonths: 61, reviews: 214, stars: 4.9, verifications: ['Teléfono', 'DNI', 'Email'], sales: 180 },
  { name: 'TecnoRafa', accountAgeMonths: 38, reviews: 96, stars: 4.7, verifications: ['Teléfono', 'Email'], sales: 88 },
  { name: 'Marta_vende', accountAgeMonths: 24, reviews: 41, stars: 4.8, verifications: ['Teléfono', 'Email'], sales: 37 },
  { name: 'Javi R.', accountAgeMonths: 12, reviews: 9, stars: 4.4, verifications: ['Email'], sales: 8 },
  { name: 'user84731', accountAgeMonths: 0.3, reviews: 0, stars: 0, verifications: [], sales: 0 },
  { name: 'Carmen B.', accountAgeMonths: 72, reviews: 320, stars: 5, verifications: ['Teléfono', 'DNI', 'Email'], sales: 301 },
  { name: 'Pablo G.', accountAgeMonths: 5, reviews: 3, stars: 3.7, verifications: ['Teléfono'], sales: 3 },
];

const CITIES: [string, number][] = [
  ['Madrid', 3], ['Getafe', 14], ['Alcalá de Henares', 31], ['Toledo', 72], ['Guadalajara', 58],
  ['Valencia', 302], ['Barcelona', 505], ['Sevilla', 390], ['Zaragoza', 274], ['Málaga', 418], ['Bilbao', 323],
];

export const CATALOG: [string, CategoryId, number][] = [
  ['iPhone 13 128 GB azul', 'moviles', 420], ['iPhone 14 Pro 256 GB', 'moviles', 690], ['Samsung Galaxy S23', 'moviles', 430],
  ['Xiaomi Redmi Note 13', 'moviles', 150], ['PlayStation 5 con lector', 'consolas', 380], ['Nintendo Switch OLED', 'consolas', 240],
  ['Steam Deck 512 GB', 'consolas', 360], ['Xbox Series X', 'consolas', 330], ['Mando DualSense', 'consolas', 45],
  ['Zapatillas Nike Dunk Low', 'moda', 85], ['Chaqueta The North Face Nuptse', 'moda', 150], ['Bolso Michael Kors', 'moda', 90],
  ['Vaqueros Levi’s 501', 'moda', 30], ['Seat León 1.5 TSI 2019', 'motor', 15500], ['Toyota Yaris Hybrid 2020', 'motor', 14200],
  ['Volkswagen Golf 2.0 TDI 2017', 'motor', 12900], ['Yamaha MT-07 2021', 'motos', 6300], ['Honda PCX 125', 'motos', 2600],
  ['Bici de carretera Orbea Orca', 'bici', 1300], ['Patinete Xiaomi 4 Pro', 'bici', 320], ['Sofá 3 plazas IKEA', 'hogar', 220],
  ['Robot aspirador Roomba i7', 'hogar', 190], ['Thermomix TM6', 'hogar', 780], ['Sony A7 III cuerpo', 'foto', 1050],
  ['Objetivo Sigma 24-70 f2.8', 'foto', 620], ['MacBook Air M1 8 GB', 'info', 560], ['iPad Air 5ª gen', 'info', 420],
  ['Monitor LG UltraGear 27"', 'info', 180], ['Sobre Pokémon 151 sellado', 'colec', 8], ['Colección LEGO Star Wars', 'colec', 260],
];

function rng(seed: number) {
  let s = seed % 2147483647 || 7;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

let counter = 0;

function make(
  rand: () => number,
  title: string,
  category: CategoryId,
  market: number,
  o: { price?: number; condition?: Condition; seller?: Seller; platform?: PlatformId; minutesAgo?: number } = {},
): Listing {
  const pick = <T,>(a: T[]) => a[Math.floor(rand() * a.length)];
  const condition = o.condition ?? pick<Condition>(['mb', 'mb', 'b', 'b', 'b', 'r', 'ar']);
  const step = market > 2000 ? 100 : market > 200 ? 5 : 1;
  const price = o.price ?? Math.max(1, Math.round((market * CONDITIONS[condition].factor * (0.55 + rand() * 0.55)) / step) * step);
  const [city, distanceKm] = pick(CITIES);
  const platform = o.platform ?? pick(PLATFORMS_BY_CATEGORY[category]);
  const id = `mock-${++counter}`;
  return {
    id,
    title,
    category,
    platform,
    url: `${PLATFORMS[platform].home}/search?q=${encodeURIComponent(title)}`,
    price,
    marketPrice: market,
    condition,
    conditionByAI: rand() < 0.35,
    seller: o.seller ?? pick(SELLERS),
    city,
    distanceKm,
    shipping: rand() < 0.7,
    inPerson: rand() < 0.85 || distanceKm < 40,
    views: Math.round(200 + rand() * 4000),
    favorites: Math.round(20 + rand() * 600),
    publishedAt: Date.now() - (o.minutesAgo ?? Math.round(1 + rand() * 90)) * 60000,
    tint: pick(tints),
    imageUrl: PRODUCT_IMAGES[title],
  };
}

const ALIASES: Record<string, string> = {
  ps5: 'playstation 5', play: 'playstation', switch: 'nintendo switch', iphone: 'iphone', mac: 'macbook',
  tm6: 'thermomix', dunk: 'nike dunk', leon: 'león', pokemon: 'pokémon',
};

const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 2147483647, 11);

export const mockSource: ListingSource = {
  id: 'mock',
  enabled: true,
  async trending() {
    const rand = rng(Math.floor(Date.now() / 60000));
    const list = CATALOG.map(([t, c, m]) => make(rand, t, c, m));
    // Un caso de posible estafa para que el filtro de fiabilidad se vea funcionando
    list.push(make(rand, 'PlayStation 5 Slim nueva precintada', 'consolas', 450, { price: 120, condition: 'mb', seller: SELLERS[4], platform: 'milanuncios', minutesAgo: 2 }));
    return list;
  },
  async search(query) {
    let q = query.toLowerCase();
    for (const [k, v] of Object.entries(ALIASES)) q = q.replace(new RegExp(`\\b${k}\\b`), v);
    const words = q.split(/\s+/).filter(Boolean);
    let base = CATALOG.filter(([t]) => words.every((w) => t.toLowerCase().includes(w)));
    if (!base.length) base = CATALOG.filter(([t]) => words.some((w) => w.length > 2 && t.toLowerCase().includes(w)));
    if (!base.length) return [];
    const rand = rng(hash(query));
    return base.slice(0, 3).flatMap(([t, c, m]) => Array.from({ length: 9 }, () => make(rand, t, c, m)));
  },
};
