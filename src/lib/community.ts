import type { CommunityDeal } from './types';

/** Temperatura del chollo: votos netos, con menos peso cuanto más antiguo. */
export const temperature = (d: CommunityDeal) =>
  Math.round((d.hot - d.cold) / Math.pow(1 + (Date.now() - d.createdAt) / 3_600_000, 0.4));
