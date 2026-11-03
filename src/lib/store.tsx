import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { defaultFilters, type Filters, type PlatformId } from './types';

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
  savedSearches: SavedSearch[];
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
  savedSearches: [],
};

type Ctx = State & {
  setFilters: (f: Filters) => void;
  setProfile: (p: Profile) => void;
  toggleFavorite: (id: string) => void;
  saveSearch: (s: SavedSearch) => void;
  removeSearch: (query: string) => void;
};

const StoreContext = createContext<Ctx | null>(null);
const KEY = 'brasa-state-v1';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setState({ ...initial, ...JSON.parse(raw) }))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

  const value: Ctx = {
    ...state,
    setFilters: (filters) => setState((s) => ({ ...s, filters })),
    setProfile: (profile) => setState((s) => ({ ...s, profile })),
    toggleFavorite: (id) =>
      setState((s) => ({
        ...s,
        favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id],
      })),
    saveSearch: (q) =>
      setState((s) => ({ ...s, savedSearches: [...s.savedSearches.filter((x) => x.query !== q.query), q] })),
    removeSearch: (query) => setState((s) => ({ ...s, savedSearches: s.savedSearches.filter((x) => x.query !== query) })),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore fuera de StoreProvider');
  return ctx;
}
