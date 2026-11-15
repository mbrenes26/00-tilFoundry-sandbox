import { describe, expect, it } from 'vitest';
import { createGame, observe, step } from '../../src/game/engine';
import type { Action, GameState } from '../../src/game/contracts';
import { GUARDIAN_STARTS, HEIGHT, WIDTH } from '../../src/game/map';

function freeze(value: unknown): void {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
}
const restore = (s: GameState): GameState => JSON.parse(JSON.stringify(s)) as GameState;
const initial = createGame(0);
const totalObjects = initial.pills.length + initial.powers.length;

describe('M-4: observación de 36 entradas', () => {
  it('fixture exacto: orden, dimensiones, actividad, vulnerabilidad y contadores', () => {
    const s = createGame(42);
    s.player = { position: { x: 4, y: 3 }, direction: 2 };
    s.guardians[0].position = { x: 8, y: 3 };
    s.guardians[1].active = false;
    s.guardians[1].respawnRemaining = 7;
    s.guardians[2].position = { x: 10, y: 11 };
    s.guardians[3].position = { x: 9, y: 5 };
    s.pills = [{ x: 4, y: 1 }, { x: 3, y: 4 }];
    s.powers = [{ x: 1, y: 1 }];
    s.lives = 2; s.powerRemaining = 30; s.phase = 'chase';
    s.phaseRemaining = 100; s.tick = 750;
    expect(observe(s)).toEqual([
      4 / WIDTH, 3 / HEIGHT,
      8 / WIDTH, 3 / HEIGHT, 1, 1,
      1 / WIDTH, 13 / HEIGHT, 0, 0,
      10 / WIDTH, 11 / HEIGHT, 1, 1,
      9 / WIDTH, 5 / HEIGHT, 1, 1,
      0, 0, 1, 0,
      1, 0, 1, 1,
      0, -2 / HEIGHT,
      -3 / WIDTH, -2 / HEIGHT,
      2 / 3, 0.5, 1, 0.5, 3 / totalObjects, 0.75,
    ]);
  });

  it('cercanía por camino y no Manhattan, independientemente del orden de objetos', () => {
    const s = createGame(1); s.player.position = { x: 8, y: 1 };
    // 10,1 está a Manhattan 2, pero requiere 6 pasos rodeando el muro 9,1.
    // 4,1 está a Manhattan/camino 4 y debe ganar.
    s.pills = [{ x: 10, y: 1 }, { x: 4, y: 1 }];
    s.powers = [...s.pills].reverse();
    expect(observe(s).slice(26, 30)).toEqual([-4 / WIDTH, 0, -4 / WIDTH, 0]);
    s.pills.reverse(); s.powers.reverse();
    expect(observe(s).slice(26, 30)).toEqual([-4 / WIDTH, 0, -4 / WIDTH, 0]);
  });

  it('empata por fila y después columna, no por orden de recorrido/lista', () => {
    const s = createGame(1); s.player.position = { x: 4, y: 3 };
    s.pills = [{ x: 3, y: 4 }, { x: 4, y: 1 }]; // Ambos a dos pasos.
    expect(observe(s).slice(26, 28)).toEqual([0, -2 / HEIGHT]);
    s.player.position = { x: 9, y: 7 };
    s.pills = [{ x: 10, y: 7 }, { x: 8, y: 7 }];
    s.powers = [...s.pills];
    expect(observe(s).slice(26, 30)).toEqual([-1 / WIDTH, 0, -1 / WIDTH, 0]);
  });

  it('objetos ausentes dan cero y guardianes inactivos conservan su inicio sin vulnerabilidad', () => {
    const s = createGame(1); s.pills = []; s.powers = []; s.powerRemaining = 60;
    s.guardians.forEach(g => { g.active = false; g.respawnRemaining = 20; });
    const o = observe(s);
    for (let i = 0; i < 4; i++) {
      expect(o.slice(2 + i * 4, 6 + i * 4)).toEqual([
        GUARDIAN_STARTS[i].x / WIDTH, GUARDIAN_STARTS[i].y / HEIGHT, 0, 0,
      ]);
    }
    expect(o.slice(26, 30)).toEqual([0, 0, 0, 0]);
    expect(o[34]).toBe(0);
    // Ausencia independiente: un objeto bajo el jugador también da desplazamiento cero.
    s.pills = [{ ...s.player.position }];
    expect(observe(s).slice(26, 30)).toEqual([0, 0, 0, 0]);
  });

  it.each([0, 1, 2, 3] as const)('dirección %i, legalidad y fronteras de contadores', direction => {
    const s = createGame(1); s.player.direction = direction;
    const o = observe(s);
    expect(o.slice(18, 22)).toEqual([0, 1, 2, 3].map(a => Number(a === direction)));
    expect(o.slice(22, 26)).toEqual([0, 1, 1, 0]);
    expect(o.slice(30)).toEqual([1, 0, 0, 1, 1, 1]);
    expect(o.filter((_, i) => i >= 2 && i < 18 && i % 4 === 1)).toEqual([0, 0, 0, 0]);
    s.lives = 0; s.tick = 3000; s.powerRemaining = 60; s.phaseRemaining = 0;
    expect(observe(s).slice(30)).toEqual([0, 1, 0, 0, 1, 0]);
    expect(observe(s).slice(2, 18).filter((_, i) => i % 4 === 3)).toEqual([1, 1, 1, 1]);
  });

  it('es puro con entrada congelada y devuelve arrays independientes con rangos finitos', () => {
    const s = createGame(4294967295); const before = JSON.stringify(s); freeze(s);
    const first = observe(s); const expected = [...first]; first[0] = -99;
    expect(observe(s)).toEqual(expected); expect(JSON.stringify(s)).toBe(before);
    expect(expected).toHaveLength(36);
    expected.forEach((v, i) => {
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(i >= 26 && i < 30 ? -1 : 0);
      expect(v).toBeLessThanOrEqual(1);
    });
  });
});

describe('M-4: continuidad JSON de GameState (sin API adicional)', () => {
  it('restaura PRNG, captura, vulnerabilidad, reaparición, inversión de fase y final exactos', () => {
    let continuous = createGame(0);
    continuous.tick = 2940; continuous.phaseRemaining = 1;
    continuous.player = { position: { x: 4, y: 1 }, direction: 1 };
    continuous.pills = [{ x: 17, y: 13 }]; continuous.powers = [{ x: 5, y: 1 }];
    continuous.guardians.forEach(g => { g.active = false; g.respawnRemaining = 20; });
    Object.assign(continuous.guardians[0], {
      position: { x: 6, y: 1 }, direction: 3, active: true, respawnRemaining: 0,
    });
    let resumed = restore(continuous);
    const types = new Set<string>(); let rngChanged = false;
    const actions: Action[] = [1, ...Array<Action>(64).fill(0)];
    for (const action of actions) {
      // Cortes también entre captura/reaparición, en frontera de fase y después de finalizar.
      resumed = restore(resumed);
      expect(resumed).toEqual(continuous);
      expect(observe(resumed)).toEqual(observe(continuous));
      const a = step(continuous, action); const b = step(resumed, action);
      expect(b).toEqual(a);
      expect(observe(b.state)).toEqual(observe(a.state));
      a.events.forEach(e => types.add(e.type));
      rngChanged ||= a.state.rngState !== continuous.rngState;
      continuous = a.state; resumed = b.state;
    }
    for (const type of ['power', 'capture', 'respawn', 'phase', 'end']) expect(types.has(type)).toBe(true);
    expect(rngChanged).toBe(true);
    expect(continuous.status).toBe('timeout'); expect(continuous.tick).toBe(3000);
    expect(continuous.powerRemaining).toBe(0);
  });

  it.each(['lost', 'won', 'timeout'] as const)('serializa todos los campos y preserva final %s', status => {
    const s = createGame(4294967295);
    Object.assign(s, { status, tick: 3000, points: 1234, lives: status === 'lost' ? 0 : 2,
      rngState: 0, captureChain: 3, powerRemaining: 12, phase: 'chase',
      phaseRemaining: 200, phaseChangePending: true });
    s.guardians[2].active = false; s.guardians[2].respawnRemaining = 13;
    const restored = restore(s);
    expect(restored).toEqual(s); expect(restored).not.toBe(s);
    expect(observe(restored)).toEqual(observe(s));
    for (const action of [0, 1, 2, 3] as const) expect(step(restored, action)).toEqual(step(s, action));
  });
});
