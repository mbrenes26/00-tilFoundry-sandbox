import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createClock, gameTime, setPaused } from '../../src/game/clock';
import { advanceGame, captureStar, restartGame, startGame } from '../../src/game/rules';

const config = { area: { x: 100, y: 250, width: 1400, height: 550 }, starSize: 200 };
const random = () => 0.5;

describe('juego-4: reloj activo puro', () => {
  it('empieza en cero con origen arbitrario y no muta el reloj', () => {
    const clock = createClock(700);
    const snapshot = structuredClone(clock);
    expect(gameTime(clock, 700)).toBe(0);
    expect(gameTime(clock, 1200)).toBe(500);
    expect(clock).toEqual(snapshot);
  });

  it('ocultación larga conserva exactamente el plazo restante sin acumular fallos', () => {
    let clock = createClock(100);
    let state = startGame(config, gameTime(clock, 100), random);
    clock = setPaused(clock, 850, true);
    expect(gameTime(clock, 1000000)).toBe(750);
    expect(advanceGame(state, gameTime(clock, 1000000), random)).toBe(state);
    clock = setPaused(clock, 1000000, false);
    expect(advanceGame(state, gameTime(clock, 1001249), random)).toBe(state);
    state = advanceGame(state, gameTime(clock, 1001250), random);
    expect(state).toMatchObject({ score: 0, misses: 1, status: 'playing' });
    expect(state.star!.startedAt).toBe(2000);
  });

  it('soporta ciclos repetidos y notificaciones de visibilidad duplicadas', () => {
    let clock = createClock(0);
    let wall = 0;
    for (let cycle = 1; cycle <= 20; cycle++) {
      wall += 50;
      clock = setPaused(clock, wall, true);
      expect(setPaused(clock, wall + 100, true)).toBe(clock);
      wall += 10000;
      expect(gameTime(clock, wall)).toBe(cycle * 50);
      clock = setPaused(clock, wall, false);
      expect(setPaused(clock, wall + 10, false)).toBe(clock);
    }
    expect(gameTime(clock, wall + 300)).toBe(1300);
  });

  it('reinicia desde pausa, descarta tiempo e inputs anteriores y empieza con 2000 ms', () => {
    let clock = createClock(100);
    let state = startGame(config, 0, random);
    const pending = { eventId: 'pending', sessionId: state.sessionId, starId: 1, x: 800, y: 525 };
    state = captureStar(state, { ...pending, eventId: 'hit' }, 400, random);
    clock = setPaused(clock, 700, true);
    const oldSession = state.sessionId;
    // Reiniciar mientras sigue oculta debe mantener el nuevo reloj pausado.
    clock = createClock(50000, true);
    state = restartGame(state, gameTime(clock, 50000), random);
    expect(state).toMatchObject({ score: 0, misses: 0, processedEventIds: [] });
    expect(state.star).toMatchObject({ startedAt: 0, durationMs: 2000 });
    expect(captureStar(state, pending, 0, random)).toBe(state);
    expect(advanceGame(state, 999999, random, oldSession)).toBe(state);
    expect(advanceGame(state, gameTime(clock, 100000), random)).toBe(state);
    clock = setPaused(clock, 100000, false);
    expect(advanceGame(state, gameTime(clock, 101999), random)).toBe(state);
    expect(advanceGame(state, gameTime(clock, 102000), random).misses).toBe(1);
  });

  it('no depende de Phaser ni de relojes o temporizadores globales', () => {
    const source = readFileSync(new URL('../../src/game/clock.ts', import.meta.url), 'utf8');
    expect(source).not.toMatch(/phaser|Date\.now|performance\.now|setInterval|setTimeout/i);
  });
});
