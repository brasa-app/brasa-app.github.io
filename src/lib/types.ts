export type PlatformId =
  | 'wallapop' | 'vinted' | 'milanuncios' | 'cochesnet' | 'motosnet'
  | 'ebay' | 'todocoleccion' | 'autoscout' | 'brasa';

export type CategoryId =
  | 'moviles' | 'consolas' | 'moda' | 'motor' | 'motos'
  | 'bici' | 'hogar' | 'foto' | 'info' | 'colec';

/** Muy bueno, Bueno, Regular, A reparar */
export type Condition = 'mb' | 'b' | 'r' | 'ar';

export type Seller = {
  name: string;
  /** Antigüedad de la cuenta en meses */
  accountAgeMonths: number;
  reviews: number;
  /** 0 si no tiene valoraciones */
  stars: number;
  verifications: string[];
  sales: number;
};

export type Listing = {
  id: string;
  title: string;
  category: CategoryId;
  platform: PlatformId;
  /** URL del anuncio original: la compra siempre se hace allí */
  url: string;
  price: number;
  /** Precio medio de mercado estimado para este producto */
  marketPrice: number;
  condition: Condition;
  /** true si el estado lo ha estimado la IA porque el vendedor no lo indicó */
  conditionByAI: boolean;
  seller: Seller;
  city: string;
  distanceKm: number;
  shipping: boolean;
  inPerson: boolean;
  views: number;
  favorites: number;
  publishedAt: number;
  /** URL de la foto, o imagen incluida en la app (require) */
  imageUrl?: string | number;
  /** Color de fondo cuando no hay imagen */
  tint: string;
};

export type Filters = {
  nationwide: boolean;
  radiusKm: number;
  minPrice?: number;
  maxPrice?: number;
  conditions: Condition[];
  delivery: 'any' | 'shipping' | 'inPerson';
  category: CategoryId | 'all';
};

export const defaultFilters: Filters = {
  nationwide: true,
  radiusKm: 50,
  conditions: [],
  delivery: 'any',
  category: 'all',
};

export type CommunityDeal = {
  id: string;
  title: string;
  price: number;
  url: string;
  platform: PlatformId;
  category: CategoryId;
  author: string;
  createdAt: number;
  hot: number;
  cold: number;
  myVote?: 'hot' | 'cold';
  imageUrl?: string;
  /** true en los chollos de ejemplo de la beta */
  example?: boolean;
};
