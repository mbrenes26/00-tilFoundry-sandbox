import type { GameClock } from './types';

/** Crear de nuevo al reiniciar; now proviene de un reloj monotónico externo. */
export function createClock(now: number, paused = false): GameClock {
  return { activeMs: 0, sampledAt: now, paused };
}

/** Solo el tiempo visible cuenta para las reglas; no programa trabajo temporal. */
export function gameTime(clock: GameClock, now: number): number {
  return clock.activeMs + (clock.paused ? 0 : Math.max(0, now - clock.sampledAt));
}

/** Notificaciones duplicadas no cambian el origen ni el tiempo acumulado. */
export function setPaused(clock: GameClock, now: number, paused: boolean): GameClock {
  if (clock.paused === paused) return clock;
  return { activeMs: gameTime(clock, now), sampledAt: now, paused };
}
