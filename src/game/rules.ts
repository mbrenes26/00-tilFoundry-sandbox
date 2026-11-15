import { containsPoint, randomStarPosition } from './geometry';
import type { CaptureInput, GameConfig, GameState, RandomSource, Star } from './types';

export function durationForScore(score: number): number {
  return Math.max(500, 2000 - 100 * score);
}

function createStar(config: GameConfig, id: number, score: number, now: number, random: RandomSource): Star {
  return {
    ...randomStarPosition(config.area, config.starSize, random),
    size: config.starSize,
    id,
    startedAt: now,
    durationMs: durationForScore(score),
  };
}

/** now es tiempo activo del juego, suministrado por el consumidor. */
export function startGame(config: GameConfig, now: number, random: RandomSource): GameState {
  const ownedConfig = { area: { ...config.area }, starSize: config.starSize };
  return {
    config: ownedConfig,
    status: 'playing',
    score: 0,
    misses: 0,
    star: createStar(ownedConfig, 1, 0, now, random),
    processedEventIds: [],
  };
}

/** Una actualización tardía vence solo la estrella que existía, sin recuperar plazos pasados. */
export function advanceGame(state: GameState, now: number, random: RandomSource): GameState {
  const star = state.star;
  if (state.status !== 'playing' || !star || now - star.startedAt < star.durationMs) return state;
  const misses = state.misses + 1;
  return {
    ...state,
    misses,
    status: misses >= 3 ? 'finished' : 'playing',
    star: misses >= 3 ? null : createStar(state.config, star.id + 1, state.score, now, random),
  };
}

/** Vence antes de capturar y conserva las identidades durante toda la partida. */
export function captureStar(state: GameState, input: CaptureInput, now: number, random: RandomSource): GameState {
  const advanced = advanceGame(state, now, random);
  if (advanced.status !== 'playing' || advanced.processedEventIds.includes(input.eventId)) return advanced;
  const consumed = { ...advanced, processedEventIds: [...advanced.processedEventIds, input.eventId] };
  // Si venció aquí, el evento nunca puede capturar la sucesora, aunque coincidan sus posiciones.
  if (advanced !== state || !advanced.star || input.starId !== advanced.star.id
    || !containsPoint(advanced.star, input)) return consumed;
  const score = advanced.score + 1;
  return {
    ...consumed,
    score,
    star: createStar(advanced.config, advanced.star.id + 1, score, now, random),
  };
}
