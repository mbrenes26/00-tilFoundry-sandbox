import { describe, expect, it } from 'vitest';
import { createGame, step } from '../../src/game/engine';
import { guardianTarget, chooseGuardianAction, SCATTER_TARGETS } from '../../src/game/guardians';
import { GUARDIAN_STARTS, HEIGHT, WIDTH, isWalkable } from '../../src/game/map';
import { nextRandom } from '../../src/game/random';
import type { Action, GameState, Position } from '../../src/game/contracts';

function fixture(): GameState {
  const s = createGame(42);
  s.pills = []; s.powers = [];
  s.guardians.forEach(g => { g.active = false; g.respawnRemaining = 1000; });
  return s;
}
function actor(s: GameState, position: Position, direction: Action = 1) {
  const g = s.guardians[0];
  Object.assign(g, { position, direction, active: true, respawnRemaining: 0 });
  return g;
}
const offsets = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const distance = (a: Position, b: Position) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
function freeze(v: unknown): void {
  if (v && typeof v === 'object') { Object.values(v).forEach(freeze); Object.freeze(v); }
}

describe('M-2: objetivos y elecciones', () => {
  it('cuatro esquinas distintas y cuatro objetivos de persecución, sin recortar coordenadas', () => {
    const s = fixture();
    expect(SCATTER_TARGETS).toEqual([{ x: 17, y: 1 }, { x: 1, y: 13 }, { x: 17, y: 13 }, { x: 1, y: 1 }]);
    expect(s.guardians.map(g => guardianTarget(s, g))).toEqual(SCATTER_TARGETS);
    s.phase = 'chase'; s.player = { position: { x: 1, y: 1 }, direction: 0 };
    s.guardians[0].position = { x: 17, y: 1 }; s.guardians[3].position = { x: 7, y: 1 };
    expect(s.guardians.map(g => guardianTarget(s, g))).toEqual([
      { x: 1, y: 1 }, { x: 1, y: -1 }, { x: -15, y: -3 }, { x: 1, y: 1 },
    ]);
    s.guardians[3].position = { x: 8, y: 1 }; s.player.position = { x: 2, y: 1 };
    expect(guardianTarget(s, s.guardians[3])).toEqual({ x: 1, y: 1 }); // exactamente 6
    s.guardians[3].position = { x: 9, y: 1 };
    expect(guardianTarget(s, s.guardians[3])).toEqual({ x: 2, y: 1 }); // 7
    for (const direction of [0, 1, 2, 3] as Action[]) {
      s.player.direction = direction;
      const [dx, dy] = offsets[direction];
      expect(guardianTarget(s, s.guardians[1])).toEqual({ x: 2 + 2 * dx, y: 1 + 2 * dy });
    }
  });

  it('minimiza Manhattan, desempata arriba/izquierda/abajo/derecha y excluye inversión en todo el mapa', () => {
    const s = fixture();
    for (let y = 0; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) {
      if (!isWalkable({ x, y })) continue;
      for (const direction of [0, 1, 2, 3] as Action[]) for (const allowReverse of [false, true]) {
        const g = actor(s, { x, y }, direction);
        for (const target of [{ x, y }, { x: -5, y: 20 }, { x: 30, y: -3 }]) {
          const legal = ([0, 3, 2, 1] as Action[]).filter(a => {
            const [dx, dy] = offsets[a]; return isWalkable({ x: x + dx, y: y + dy });
          });
          const forward = legal.filter(a => a !== (direction + 2) % 4);
          const candidates = allowReverse || !forward.length ? legal : forward;
          const expected = [...candidates].sort((a, b) => {
            const pa = { x: x + offsets[a][0], y: y + offsets[a][1] };
            const pb = { x: x + offsets[b][0], y: y + offsets[b][1] };
            return distance(pa, target) - distance(pb, target);
          })[0];
          expect(chooseGuardianAction(g, target, allowReverse)).toBe(expected);
        }
      }
    }
    const g = actor(s, { x: 9, y: 7 }, 1);
    expect(chooseGuardianAction(g, { x: 8, y: 7 }, false)).toBe(1);
    expect(chooseGuardianAction(g, { x: 8, y: 7 }, true)).toBe(3);
    actor(s, { x: 9, y: 13 }, 2); // callejón: única salida arriba
    expect(chooseGuardianAction(g, { x: 9, y: 20 }, false)).toBe(0);
  });

  it('mueve jugador primero y calcula el reflejo con guardián 1 anterior al movimiento enemigo', () => {
    const s = fixture(); s.phase = 'chase'; s.phaseRemaining = 100;
    s.player = { position: { x: 8, y: 7 }, direction: 1 };
    actor(s, { x: 8, y: 7 }, 1);
    Object.assign(s.guardians[2], { position: { x: 13, y: 7 }, direction: 0, active: true });
    const result = step(s, 1);
    expect(result.state.guardians[0].position).toEqual({ x: 9, y: 7 });
    // Objetivo 14,7 con id1 antiguo; secuencial daría objetivo 13,7 y empate hacia izquierda.
    expect(result.state.guardians[2].position).toEqual({ x: 14, y: 7 });
    expect(result.events[0]).toMatchObject({ type: 'move', actor: 'player' });
  });
});

describe('M-2: fronteras, vulnerabilidad y reaparición', () => {
  it('70 dispersión y 200 persecución repetidos; transición al final permite inversión en el paso siguiente', () => {
    let s = fixture(); const phases: number[] = [];
    const expected: Record<number, [string, number]> = {
      69: ['scatter', 1], 70: ['chase', 200], 269: ['chase', 1], 270: ['scatter', 70],
      339: ['scatter', 1], 340: ['chase', 200], 539: ['chase', 1], 540: ['scatter', 70],
    };
    for (let i = 1; i <= 540; i++) {
      const r = step(s, 0); s = r.state;
      r.events.filter(e => e.type === 'phase').forEach(() => phases.push(i));
      if (expected[i]) expect([s.phase, s.phaseRemaining]).toEqual(expected[i]);
    }
    expect(phases).toEqual([70, 270, 340, 540]);
    const boundary = fixture(); boundary.tick = 70; boundary.phase = 'chase'; boundary.phaseRemaining = 200;
    boundary.player.position = { x: 8, y: 7 }; actor(boundary, { x: 9, y: 7 }, 1);
    expect(step(boundary, 0).state.guardians[0].direction).toBe(3);
    boundary.phaseRemaining = 199;
    expect(step(boundary, 0).state.guardians[0].direction).toBe(1);
    boundary.phase = 'scatter'; boundary.phaseRemaining = 1;
    expect(step(boundary, 0).state.guardians[0].direction).toBe(1); // todavía dispersión
  });

  it('recoger antes de enemigos; 60 movimientos vulnerables; nuevo poder reinicia duración y cadena', () => {
    let s = fixture(); s.player.position = { x: 2, y: 1 };
    s.powers = [{ x: 3, y: 1 }]; s.captureChain = 3;
    actor(s, { x: 9, y: 7 }, 1);
    const random = nextRandom(s.rngState);
    let r = step(s, 1); s = r.state;
    expect(s.powers).toEqual([]); expect(s.powerRemaining).toBe(59); expect(s.captureChain).toBe(0);
    expect(s.rngState).toBe(random.state);
    expect(r.events.find(e => e.type === 'power')).toEqual({ type: 'power', position: { x: 3, y: 1 }, points: 50 });
    expect(r.events.findIndex(e => e.type === 'power')).toBeLessThan(r.events.findIndex(e => e.type === 'move' && e.actor === 1));
    for (let i = 2; i <= 60; i++) {
      const before = s.rngState; r = step(s, 0); s = r.state;
      expect(s.powerRemaining).toBe(60 - i); expect(s.rngState).toBe(nextRandom(before).state);
    }
    const before = s.rngState; s = step(s, 0).state; expect(s.rngState).toBe(before);
    s.player.position = { x: 2, y: 1 }; s.powers = [{ x: 3, y: 1 }]; s.powerRemaining = 12; s.captureChain = 2;
    expect(step(s, 1).state).toMatchObject({ powerRemaining: 59, captureChain: 0 });
  });

  it('vulnerabilidad selecciona con PRNG sembrado sobre candidatos legales sin invertir', () => {
    for (const seed of [0, 1, 42, 43, 100]) {
      const s = fixture(); s.rngState = seed; s.powerRemaining = 10;
      actor(s, { x: 9, y: 7 }, 1);
      const random = nextRandom(seed);
      expect(step(s, 0).state.guardians[0].direction).toBe(1); // solo derecha sin invertir
      actor(s, { x: 4, y: 3 }, 1); // arriba y abajo legales; izquierda excluida
      expect(step(s, 0).state.guardians[0].direction).toBe(([0, 2] as Action[])[Math.floor(random.value * 2)]);
    }
  });

  it('inactivo 20 pasos: al vigésimo reaparece inmóvil con evento para excluir colisión; luego se mueve', () => {
    let s = fixture(); s.guardians[0].respawnRemaining = 20;
    s.guardians[0].position = { ...GUARDIAN_STARTS[0] };
    for (let i = 1; i <= 19; i++) {
      const r = step(s, 0); s = r.state;
      expect(s.guardians[0]).toMatchObject({ active: false, respawnRemaining: 20 - i, position: GUARDIAN_STARTS[0] });
      expect(r.events.some(e => e.type === 'respawn')).toBe(false);
    }
    const r = step(s, 0); s = r.state;
    expect(s.guardians[0]).toMatchObject({ active: true, respawnRemaining: 0, position: GUARDIAN_STARTS[0], direction: 0 });
    expect(r.events).toContainEqual({ type: 'respawn', guardianId: 1 });
    expect(r.events.some(e => e.type === 'move' && e.actor === 1)).toBe(false);
    expect(step(s, 0).state.guardians[0].position).not.toEqual(GUARDIAN_STARTS[0]);
  });

  it('no muta entradas congeladas y repite evolución/eventos/PRNG con la misma semilla', () => {
    let a = createGame(42), b = createGame(42);
    a.powerRemaining = 60; b.powerRemaining = 60;
    for (let i = 0; i < 100; i++) {
      const snapshot = JSON.stringify(a); freeze(a);
      const ra = step(a, (i % 4) as Action), rb = step(b, (i % 4) as Action);
      expect(JSON.stringify(a)).toBe(snapshot); expect(ra).toEqual(rb);
      if (i === 0) {
        let rng = 42;
        for (let j = 0; j < 4; j++) rng = nextRandom(rng).state;
        expect(ra.state.rngState).toBe(rng);
        expect(ra.state.guardians[0].position).not.toEqual(a.guardians[0].position);
      }
      a = ra.state; b = rb.state;
    }
  });
});
