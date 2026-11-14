import { describe, expect, it } from 'vitest';
import { createGame, step } from '../../src/game/engine';
import { GUARDIAN_STARTS, PLAYER_START } from '../../src/game/map';
import type { GameState, GuardianId } from '../../src/game/contracts';

function fixture(): GameState {
  const s = createGame(42);
  s.pills = [{ x: 17, y: 13 }]; s.powers = []; s.phaseRemaining = 69;
  s.player = { position: { x: 4, y: 1 }, direction: 1 };
  s.guardians.forEach(g => { g.active = false; g.respawnRemaining = 1000; });
  return s;
}
// El corredor obliga a ir a la izquierda desde 6,1 (compartida) o 5,1 (cruce).
function collide(s: GameState, ids: GuardianId[], crossing = false) {
  for (const id of ids) Object.assign(s.guardians[id - 1], {
    position: { x: crossing ? 5 : 6, y: 1 }, direction: 3, active: true, respawnRemaining: 0,
  });
}
function freeze(value: unknown): void {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
}

describe('M-3: recogida, colisiones y cadena', () => {
  it('mueve, recoge una píldora por 10 y conserva orden y entrada congelada', () => {
    const s = fixture(); s.pills.unshift({ x: 5, y: 1 }); s.points = 100;
    const before = JSON.stringify(s); freeze(s);
    const r = step(s, 1);
    expect(r.state.points).toBe(110); expect(r.state.pills).toEqual([{ x: 17, y: 13 }]);
    expect(r.events.slice(0, 2)).toEqual([
      { type: 'move', actor: 'player', from: { x: 4, y: 1 }, to: { x: 5, y: 1 } },
      { type: 'pill', position: { x: 5, y: 1 }, points: 10 },
    ]);
    expect(JSON.stringify(s)).toBe(before);
    expect(step(r.state, 0).state.points).toBe(110);
  });

  it.each([false, true])('poder antes de mover y colisionar, compartida/cruce=%s', crossing => {
    const s = fixture(); s.powers = [{ x: 5, y: 1 }]; collide(s, [1], crossing);
    const r = step(s, 1);
    expect(r.state).toMatchObject({ points: 250, lives: 3, powerRemaining: 59, captureChain: 1 });
    expect(r.events.map(e => e.type)).toEqual(['move', 'power', 'move', 'capture']);
    expect(r.state.guardians[0]).toMatchObject({ position: GUARDIAN_STARTS[0], active: false, respawnRemaining: 20, direction: 0 });
  });

  it('captura simultánea en orden por id: 200/400/800/1600', () => {
    const s = fixture(); s.powerRemaining = 10; collide(s, [1, 2, 3, 4]);
    const r = step(s, 1);
    expect(r.events.filter(e => e.type === 'capture')).toEqual([
      { type: 'capture', guardianId: 1, points: 200 }, { type: 'capture', guardianId: 2, points: 400 },
      { type: 'capture', guardianId: 3, points: 800 }, { type: 'capture', guardianId: 4, points: 1600 },
    ]);
    expect(r.state).toMatchObject({ points: 3000, captureChain: 4, lives: 3 });
    expect(r.state.guardians.every(g => !g.active && g.respawnRemaining === 20)).toBe(true);
  });

  it('cadena entre pasos, saturación en 1600 y renovación vuelve a 200', () => {
    let s = fixture(); s.powerRemaining = 20;
    for (const points of [200, 400, 800, 1600, 1600]) {
      s.player.position = { x: 4, y: 1 }; collide(s, [1]);
      const r = step(s, 1);
      expect(r.state.points - s.points).toBe(points); s = r.state;
    }
    s.player.position = { x: 4, y: 1 }; s.powers = [{ x: 5, y: 1 }]; collide(s, [1]);
    expect(step(s, 1).state).toMatchObject({ points: 4850, powerRemaining: 59, captureChain: 1 });
  });

  it('último paso vulnerable captura antes de agotar poder y limpiar cadena', () => {
    const s = fixture(); s.powerRemaining = 1; s.captureChain = 2; collide(s, [1]);
    expect(step(s, 1).state).toMatchObject({ points: 800, lives: 3, powerRemaining: 0, captureChain: 0 });
    s.powerRemaining = 0;
    const r = step(s, 1);
    expect(r.state.lives).toBe(2); expect(r.events.some(e => e.type === 'capture')).toBe(false);
  });

  it('capturado espera 20 pasos completos y reaparece sin colisión aunque comparta casilla', () => {
    let s = fixture(); s.powerRemaining = 60; collide(s, [1]); s = step(s, 1).state;
    s.player.position = { ...GUARDIAN_STARTS[0] };
    for (let i = 1; i <= 19; i++) {
      s = step(s, 0).state;
      expect(s.guardians[0]).toMatchObject({ active: false, respawnRemaining: 20 - i });
    }
    s.powerRemaining = 0;
    const r = step(s, 0);
    expect(r.state.lives).toBe(3); expect(r.state.guardians[0].active).toBe(true);
    expect(r.events.filter(e => e.type !== 'move')).toEqual([{ type: 'respawn', guardianId: 1 }]);
  });
});

describe('M-3: muerte, limpieza y prioridad de finales', () => {
  it.each([false, true])('colisión mortal compartida/cruce=%s pierde una sola vida y no captura', crossing => {
    const s = fixture(); collide(s, [1, 2, 3, 4], crossing);
    s.points = 900; s.pills.unshift({ x: 5, y: 1 }); s.captureChain = 3;
    s.phase = 'chase'; s.phaseRemaining = 1;
    const r = step(s, 1);
    expect(r.state).toMatchObject({ points: 910, lives: 2, tick: 1, phase: 'scatter', phaseRemaining: 70, powerRemaining: 0, captureChain: 0, status: 'running' });
    expect(r.state.player).toEqual({ position: PLAYER_START, direction: 1 });
    expect(r.state.guardians).toEqual(createGame(42).guardians);
    expect(r.state.pills).toEqual([{ x: 17, y: 13 }]); expect(r.state.powers).toEqual(s.powers);
    expect(r.events.filter(e => e.type === 'death')).toEqual([{ type: 'death', lives: 2 }]);
    expect(r.events.some(e => e.type === 'capture' || e.type === 'phase')).toBe(false);
    expect(r.events.at(-1)).toEqual({ type: 'death', lives: 2 });
  });

  it('muerte limpia también guardianes inactivos y conserva objetos, PRNG, semilla y puntos sin vidas extra', () => {
    const s = fixture(); s.points = 100000; s.tick = 200; s.rngState = 123;
    s.powers = [{ x: 15, y: 1 }]; s.guardians[2].direction = 2;
    collide(s, [1]); const r = step(s, 1);
    expect(r.state.guardians).toEqual(createGame(42).guardians);
    expect(r.state).toMatchObject({ points: 100000, lives: 2, tick: 201, rngState: 123, seed: 42, pills: s.pills, powers: s.powers });
  });

  it.each([
    [1, true, 2999, 'lost'], [1, false, 2999, 'lost'], [1, true, 10, 'lost'],
    [2, false, 2999, 'timeout'], [2, true, 2999, 'won'], [3, true, 2999, 'won'], [3, false, 2999, 'timeout'],
    [3, true, 10, 'won'],
  ] as const)('vidas=%i vacío=%s tick=%i final=%s', (lives, empty, tick, status) => {
    const s = fixture(); s.lives = lives; s.tick = tick;
    if (empty) s.pills = [{ x: 5, y: 1 }];
    if (lives < 3) collide(s, [1]);
    const r = step(s, 1);
    expect(r.state.status).toBe(status); expect(r.state.tick).toBe(tick + 1);
    expect(r.events.at(-1)).toEqual({ type: 'end', status });
    if (lives < 3) expect(r.events.findIndex(e => e.type === 'death')).toBeLessThan(r.events.findIndex(e => e.type === 'end'));
  });

  it('no gana mientras quede un poder y llega exactamente a 3000', () => {
    let s = fixture(); s.pills = []; s.powers = [{ x: 15, y: 1 }]; s.tick = 2998;
    s = step(s, 0).state; expect(s).toMatchObject({ tick: 2999, status: 'running' });
    expect(step(s, 0).state).toMatchObject({ tick: 3000, status: 'timeout' });
  });

  it('final se resuelve antes de temporizadores; último poder gana y luego queda en 59', () => {
    const s = fixture(); s.pills = []; s.powers = [{ x: 5, y: 1 }]; s.phaseRemaining = 1;
    const r = step(s, 1);
    expect(r.state).toMatchObject({ points: 50, status: 'won', powerRemaining: 59, phase: 'chase', phaseRemaining: 200 });
    expect(r.events.map(e => e.type)).toEqual(['move', 'power', 'end', 'phase']);
  });

  it.each(['lost', 'won', 'timeout'] as const)('terminal %s no evoluciona, emite ni muta', status => {
    const s = fixture(); s.status = status; s.powerRemaining = 1; s.phaseRemaining = 1;
    const before = JSON.stringify(s); freeze(s);
    const r = step(s, 1);
    expect(r).toEqual({ state: s, events: [] }); expect(JSON.stringify(s)).toBe(before);
  });
});
