import AsyncStorage from '@react-native-async-storage/async-storage';

import { loadEncrypted, saveEncrypted, wipeEncrypted } from './secure-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { defaultFilters, type CommunityDeal, type Filters, type Listing, type PlatformId } from './types';

export type LinkedAccount = { linked: boolean; stars: number; reviews: number };

export type Profile = {
  name: string;
  bio: string;
  address: string;
  photoUri?: string;
  accounts: Partial<Record<PlatformId, LinkedAccount>>;
};

export type SavedSearch = { query: string; maxPrice?: number };

type State = {
  filters: Filters;
  profile: Profile;
  favorites: string[];
  favoriteItems: Record<string, Listing>;
  onboarded: boolean;
  city: string;
  savedSearches: SavedSearch[];
  deals: CommunityDeal[];
  reported: string[];
  blockedSellers: string[];
};

const initial: State = {
  filters: defaultFilters,
  profile: {
    name: 'Ángel',
    bio: 'Vendo lo que ya no uso. Envíos en 24 h y siempre bien embalado.',
    address: '',
    accounts: {
      wallapop: { linked: false, stars: 0, reviews: 0 },
      vinted: { linked: false, stars: 0, reviews: 0 },
      milanuncios: { linked: false, stars: 0, reviews: 0 },
      ebay: { linked: false, stars: 0, reviews: 0 },
      cochesnet: { linked: false, stars: 0, reviews: 0 },
    },
  },
  favorites: [],
  favoriteItems: {},
  onboarded: false,
  city: 'Madrid',
  savedSearches: [],
  reported: [],
  blockedSellers: [],
  deals: [
    { id: 'c1', title: 'Nintendo Switch OLED con Zelda', price: 210, url: 'https://es.wallapop.com', platform: 'wallapop', category: 'consolas', author: 'Marta', createdAt: Date.now() - 40 * 60000, hot: 184, cold: 12, example: true },
    { id: 'c2', title: 'Chaqueta The North Face Nuptse talla M', price: 75, url: 'https://www.vinted.es', platform: 'vinted', category: 'moda', author: 'Dani', createdAt: Date.now() - 95 * 60000, hot: 121, cold: 9, example: true },
    { id: 'c3', title: 'Thermomix TM6 con garantía', price: 650, url: 'https://www.milanuncios.com', platform: 'milanuncios', category: 'hogar', author: 'Rosa', createdAt: Date.now() - 180 * 60000, hot: 64, cold: 30, example: true },
  ],
};

type Ctx = State & {
  setFilters: (f: Filters) => void;
  setProfile: (p: Profile) => void;
  toggleFavorite: (l: Listing) => void;
  finishOnboarding: (city: string) => void;
  loaded: boolean;
  saveSearch: (s: SavedSearch) => void;
  removeSearch: (query: string) => void;
  addDeal: (d: Omit<CommunityDeal, 'id' | 'createdAt' | 'hot' | 'cold'>) => void;
  vote: (id: string, v: 'hot' | 'cold') => void;
  report: (listingId: string) => void;
  blockSeller: (name: string) => void;
  isHidden: (l: { id: string; seller: { name: string } }) => boolean;
  resetAll: () => void;
};

const StoreContext = createContext<Ctx | null>(null);
const KEY = 'brasa-secure-v1';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadEncrypted<State>(KEY)
      .then((saved) => saved && setState({ ...initial, ...saved }))
      .catch(() => {})
      .finally(() => setLoaded(true));
    // Borra datos de versiones antiguas que se guardaban sin cifrar
    ['brasa-state-v1', 'brasa-state-v2', 'brasa-state-v3'].forEach((k) => AsyncStorage.removeItem(k).catch(() => {}));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    // Pequeña espera para no cifrar en cada pulsación de tecla
    const id = setTimeout(() => saveEncrypted(KEY, state).catch(() => {}), 400);
    return () => clearTimeout(id);
  }, [state, loaded]);

  const value: Ctx = {
    ...state,
    setFilters: (filters) => setState((s) => ({ ...s, filters })),
    setProfile: (profile) => setState((s) => ({ ...s, profile })),
    loaded,
    finishOnboarding: (city) => setState((s) => ({ ...s, onboarded: true, city })),
    toggleFavorite: (l) =>
      setState((s) => {
        const on = s.favorites.includes(l.id);
        const items = { ...s.favoriteItems };
        if (on) delete items[l.id];
        else items[l.id] = l;
        return { ...s, favorites: on ? s.favorites.filter((f) => f !== l.id) : [...s.favorites, l.id], favoriteItems: items };
      }),
    saveSearch: (q) =>
      setState((s) => ({ ...s, savedSearches: [...s.savedSearches.filter((x) => x.query !== q.query), q] })),
    removeSearch: (query) => setState((s) => ({ ...s, savedSearches: s.savedSearches.filter((x) => x.query !== query) })),
    addDeal: (d) =>
      setState((s) => ({ ...s, deals: [{ ...d, id: `u${Date.now()}`, createdAt: Date.now(), hot: 1, cold: 0, myVote: 'hot' }, ...s.deals] })),
    vote: (id, v) =>
      setState((s) => ({
        ...s,
        deals: s.deals.map((d) => {
          if (d.id !== id) return d;
          const undo = d.myVote === v;
          const n = { ...d, hot: d.hot - (d.myVote === 'hot' ? 1 : 0), cold: d.cold - (d.myVote === 'cold' ? 1 : 0) };
          if (undo) return { ...n, myVote: undefined };
          return { ...n, [v]: n[v] + 1, myVote: v };
        }),
      })),
    report: (id) => setState((s) => ({ ...s, reported: [...new Set([...s.reported, id])] })),
    blockSeller: (name) => setState((s) => ({ ...s, blockedSellers: [...new Set([...s.blockedSellers, name])] })),
    isHidden: (l) => state.reported.includes(l.id) || state.blockedSellers.includes(l.seller.name),
    resetAll: () => {
      wipeEncrypted(KEY).catch(() => {});
      setState(initial);
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore fuera de StoreProvider');
  return ctx;
}
