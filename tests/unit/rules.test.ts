import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { advanceGame, captureStar, durationForScore, restartGame, startGame } from '../../src/game/rules';
import type { GameState } from '../../src/game/types';

const config = { area: { x: 100, y: 250, width: 1400, height: 550 }, starSize: 200 };
const random = () => 0.5;
const start = (now = 0) => startGame(config, now, random);
const hit = (state: GameState, now: number, eventId: string) => captureStar(state, {
  eventId, sessionId: state.sessionId, starId: state.star!.id, x: state.star!.x, y: state.star!.y,
}, now, random);

// La API recibe tiempo del reloj del juego, no consulta el reloj global.
describe('juego-1: estado puro inicial', () => {
  it('inicia con cero puntos, cero fallos y una única estrella de 2000 ms', () => {
    const state = start(700);
    expect(state).toMatchObject({ score: 0, misses: 0, status: 'playing', processedEventIds: [] });
    expect(state.star).toMatchObject({ id: 1, startedAt: 700, durationMs: 2000, size: 200, x: 800, y: 525 });
  });

  it('no importa Phaser ni consulta reloj o azar globales', () => {
    for (const path of ['rules', 'geometry', 'types']) {
      const source = readFileSync(new URL(`../../src/game/${path}.ts`, import.meta.url), 'utf8');
      expect(source).not.toMatch(/phaser|Date\.now|performance\.now|Math\.random|setInterval/i);
    }
  });
});

describe('juego-2: captura e identidad de entradas', () => {
  it('captura dentro, suma exactamente un punto y crea la siguiente sin mutar el estado previo', () => {
    const state = start();
    const snapshot = structuredClone(state);
    const next = hit(state, 100, 'a');
    expect(next).toMatchObject({ score: 1, misses: 0 });
    expect(next.star).toMatchObject({ id: 2, startedAt: 100, durationMs: 1900 });
    expect(state).toEqual(snapshot);
    expect(captureStar(next, { eventId: 'a', sessionId: 1, starId: 1, x: 800, y: 525 }, 101, random)).toBe(next);
    // Ni siquiera reasignar el id de la estrella permite reutilizar el evento.
    expect(hit(next, 102, 'a')).toBe(next);
  });

  it('captura en el borde visible', () => {
    const state = start();
    expect(captureStar(state, { eventId: 'edge', sessionId: 1, starId: 1, x: 700, y: 425 }, 1, random).score).toBe(1);
  });

  it('tocar fuera no altera puntos, fallos, estrella ni plazo, y consume la identidad del evento', () => {
    const state = start();
    const next = captureStar(state, { eventId: 'outside', sessionId: 1, starId: 1, x: 0, y: 0 }, 500, random);
    expect(next.score).toBe(0);
    expect(next.misses).toBe(0);
    expect(next.star).toEqual(state.star);
    expect(hit(next, 501, 'outside')).toBe(next);
  });

  it('ignora entradas dirigidas a una estrella anterior', () => {
    const next = hit(start(), 100, 'a');
    const stale = captureStar(next, { eventId: 'b', sessionId: 1, starId: 1, x: 800, y: 525 }, 101, random);
    expect(stale.score).toBe(1);
    expect(stale.star).toEqual(next.star);
  });

  it('deduplica eventos antiguos tras una secuencia larga, no solo el último', () => {
    let state = start();
    for (let i = 0; i < 100; i++) state = hit(state, i, `event-${i}`);
    expect(hit(state, 101, 'event-0')).toBe(state);
    expect(state.score).toBe(100);
  });
});

describe('juego-3: duración y vencimiento', () => {
  it.each([[0, 2000], [1, 1900], [14, 600], [15, 500], [16, 500], [1000, 500]])
    ('puntaje %s corresponde a %s ms', (score, duration) => {
      expect(durationForScore(score)).toBe(duration);
    });

  it('justo antes del plazo no vence y aún permite captura', () => {
    const state = start(500);
    expect(advanceGame(state, 2499, random)).toBe(state);
    expect(hit(state, 2499, 'a')).toMatchObject({ score: 1, misses: 0 });
  });

  it.each([2500, 2501, 100000])('en o después del plazo (%s) cuenta un solo fallo y reinicia desde la actualización', (now) => {
    const state = advanceGame(start(500), now, random);
    expect(state).toMatchObject({ score: 0, misses: 1 });
    expect(state.star).toMatchObject({ id: 2, startedAt: now, durationMs: 2000 });
    expect(advanceGame(state, now, random)).toBe(state);
  });

  it.each([2000, 2001])('el vencimiento prevalece ante la captura a %s ms, sin doble efecto', (now) => {
    const state = hit(start(), now, 'boundary');
    expect(state).toMatchObject({ score: 0, misses: 1 });
    expect(state.star!.id).toBe(2);
    expect(hit(state, now, 'boundary')).toBe(state);
  });

  it('una actualización previa al clic no deja capturar la sucesora con una entrada vieja', () => {
    const initial = start();
    const expired = advanceGame(initial, 2000, random);
    const state = captureStar(expired, { eventId: 'late', sessionId: 1, starId: 1, x: 800, y: 525 }, 2000, random);
    expect(state).toMatchObject({ score: 0, misses: 1 });
    expect(state.star).toEqual(expired.star);
  });

  it('una estrella capturada no suma después un fallo al llegar a su antiguo plazo', () => {
    const state = hit(start(), 1900, 'a');
    expect(advanceGame(state, 2000, random)).toBe(state);
  });

  it('mantiene la duración vigente al fallar y elimina la estrella al tercer fallo', () => {
    let state = hit(start(), 100, 'a');
    for (let misses = 1; misses <= 3; misses++) {
      state = advanceGame(state, state.star!.startedAt + state.star!.durationMs, random);
      expect(state.score).toBe(1);
      expect(state.misses).toBe(misses);
      if (misses < 3) expect(state.star!.durationMs).toBe(1900);
    }
    expect(state).toMatchObject({ status: 'finished', star: null });
    expect(advanceGame(state, 100000, random)).toBe(state);
    expect(captureStar(state, { eventId: 'ended', sessionId: 1, starId: 3, x: 800, y: 525 }, 100000, random)).toBe(state);
  });

  it('conserva puntaje, fallos, duración e ids en secuencias largas de aciertos y vencimientos', () => {
    let state = start();
    let now = 0;
    for (let score = 1; score <= 200; score++) {
      state = hit(state, ++now, `hit-${score}`);
      expect(state.score).toBe(score);
      expect(state.star!.durationMs).toBe(Math.max(500, 2000 - 100 * score));
      if (score === 50 || score === 150) {
        now += state.star!.durationMs;
        state = advanceGame(state, now, random);
      }
    }
    expect(state.misses).toBe(2);
    expect(state.star!.id).toBe(203);
    state = advanceGame(state, now + 500, random);
    expect(state).toMatchObject({ status: 'finished', score: 200, misses: 3, star: null });
  });
});

describe('juego-4: reinicio y aislamiento de partidas', () => {
  it.each(['playing', 'finished'] as const)('reinicia desde %s sin conservar recursos anteriores', (status) => {
    let previous = hit(start(100), 200, 'used');
    previous = advanceGame(previous, 2100, random);
    if (status === 'finished') {
      previous = advanceGame(previous, 4000, random);
      previous = advanceGame(previous, 5900, random);
      expect(previous).toMatchObject({ status: 'finished', score: 1, misses: 3, star: null });
    }
    const snapshot = structuredClone(previous);
    const state = restartGame(previous, 9000, random);
    expect(state).toMatchObject({ status: 'playing', score: 0, misses: 0, processedEventIds: [] });
    expect(state.sessionId).toBe(previous.sessionId + 1);
    expect(state.star).toMatchObject({ id: 1, startedAt: 9000, durationMs: 2000 });
    expect(previous).toEqual(snapshot);
    // El mismo id físico puede usarse en la nueva partida; los pendientes viejos no.
    expect(hit(state, 9001, 'used').score).toBe(1);
    const pending = { sessionId: previous.sessionId, eventId: 'pending', starId: 1, x: 800, y: 525 };
    expect(captureStar(state, pending, 999999, random)).toBe(state);
    expect(advanceGame(state, 999999, random, previous.sessionId)).toBe(state);
    expect(advanceGame(state, 10999, random, state.sessionId)).toBe(state);
    expect(advanceGame(state, 11000, random, state.sessionId).misses).toBe(1);
  });

  it('aísla entradas y callbacks de múltiples reinicios, incluso con ids de estrella repetidos', () => {
    const original = start();
    let state = original;
    for (let i = 1; i <= 10; i++) state = restartGame(state, i * 100, random);
    expect(state.sessionId).toBe(11);
    for (let sessionId = 1; sessionId <= 10; sessionId++) {
      expect(captureStar(state, { sessionId, eventId: 'stale', starId: 1, x: 800, y: 525 }, 100000, random)).toBe(state);
      expect(advanceGame(state, 100000, random, sessionId)).toBe(state);
    }
    expect(hit(state, 1001, 'fresh').score).toBe(1);
  });
});
