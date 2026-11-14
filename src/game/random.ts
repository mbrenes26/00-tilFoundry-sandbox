/** Mulberry32 puro. Cada llamada devuelve estado uint32 y valor en [0,1). */
export function nextRandom(state: number): { state: number; value: number } {
  const nextState = (state + 0x6d2b79f5) >>> 0;
  let t = nextState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { state: nextState, value: ((t ^ (t >>> 14)) >>> 0) / 4294967296 };
}

export function normalizeSeed(seed: number): number {
  if (!Number.isSafeInteger(seed)) throw new Error('La semilla debe ser un entero seguro.');
  return seed >>> 0;
}
