import { describe, expect, it } from 'vitest';
import { MAP, WIDTH, HEIGHT, PLAYER_START, GUARDIAN_STARTS, POWER_STARTS, isWalkable } from '../../src/game/map';
import { createGame, legalActions, step } from '../../src/game/engine';
import { nextRandom } from '../../src/game/random';
import type { Action, GameState, Position } from '../../src/game/contracts';

const key = ({ x, y }: Position) => `${x},${y}`;
const offsets = [[0, -1], [1, 0], [0, 1], [-1, 0]];
function freeze(value: unknown): void {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
}

describe('M-1: mapa e inicialización', () => {
  it('19×15 original, conectado y sin envolvimiento', () => {
    expect(WIDTH).toBe(19);
    expect(HEIGHT).toBe(15);
    expect(MAP).toHaveLength(HEIGHT);
    for (const row of MAP) {
      expect(row).toHaveLength(WIDTH);
      expect(row).toMatch(/^[#.]+$/);
    }
    const cells: Position[] = [];
    for (let y = 0; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) {
      if (isWalkable({ x, y })) cells.push({ x, y });
      if (x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1) expect(isWalkable({ x, y })).toBe(false);
    }
    const visited = new Set([key(PLAYER_START)]);
    const queue = [{ ...PLAYER_START }];
    for (let i = 0; i < queue.length; i++) for (const [dx, dy] of offsets) {
      const p = { x: queue[i].x + dx, y: queue[i].y + dy };
      if (isWalkable(p) && !visited.has(key(p))) { visited.add(key(p)); queue.push(p); }
    }
    expect(visited.size).toBe(cells.length);
    expect(cells.length).toBeGreaterThan(100);
    for (const p of [{ x: -1, y: 1 }, { x: WIDTH, y: 1 }, { x: 1, y: -1 }, { x: 1, y: HEIGHT }, { x: 1.5, y: 1 }]) expect(isWalkable(p)).toBe(false);
  });

  it('cuatro poderes; cada casilla restante tiene píldora salvo los cinco inicios', () => {
    const state = createGame(42);
    const starts = [PLAYER_START, ...GUARDIAN_STARTS];
    expect(new Set(starts.map(key)).size).toBe(5);
    starts.forEach(p => expect(isWalkable(p)).toBe(true));
    expect(state.player.position).toEqual(PLAYER_START);
    expect(state.guardians.map(g => g.position)).toEqual(GUARDIAN_STARTS);
    expect(state.powers).toEqual(POWER_STARTS);
    expect(new Set(state.powers.map(key)).size).toBe(4);
    const objects = [...state.pills, ...state.powers];
    const objectKeys = new Set(objects.map(key));
    expect(objectKeys.size).toBe(objects.length);
    for (let y = 0; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) {
      const p = { x, y };
      expect(objectKeys.has(key(p))).toBe(isWalkable(p) && !starts.some(s => key(s) === key(p)));
    }
    expect(state).toMatchObject({ seed: 42, rngState: 42, tick: 0, points: 0, lives: 3, phase: 'scatter', phaseRemaining: 70, powerRemaining: 0, captureChain: 0, status: 'running' });
    expect(state.guardians.map(g => [g.id, g.active, g.respawnRemaining])).toEqual([[1, true, 0], [2, true, 0], [3, true, 0], [4, true, 0]]);
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
  });
});

describe('M-1: acciones y pureza', () => {
  it('0 arriba/1 derecha/2 abajo/3 izquierda: legal una casilla, ilegal inmóvil, en todo el mapa', () => {
    const initial = createGame(123);
    // Aislar movimiento de la resolución de colisiones (cubierta en M-3).
    initial.guardians.forEach(g => { g.active = false; g.respawnRemaining = 1000; });
    for (let y = 0; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) {
      if (!isWalkable({ x, y })) continue;
      const state: GameState = { ...initial, player: { position: { x, y }, direction: 1 } };
      const expected: Action[] = [];
      offsets.forEach(([dx, dy], id) => { if (isWalkable({ x: x + dx, y: y + dy })) expected.push(id as Action); });
      expect(legalActions(state)).toEqual(expected);
      for (const action of [0, 1, 2, 3] as Action[]) {
        const [dx, dy] = offsets[action];
        const legal = expected.includes(action);
        const result = step(state, action);
        expect(result.state.player.position).toEqual(legal ? { x: x + dx, y: y + dy } : { x, y });
        expect(result.state.player.direction).toBe(legal ? action : 1);
        expect(result.state.tick).toBe(1);
      }
    }
  });

  it('no muta ni comparte datos mutables con entrada, constantes u otra partida', () => {
    const state = createGame(42);
    const snapshot = JSON.stringify(state);
    freeze(state);
    expect(legalActions(state)).toEqual([1, 2]);
    const result = step(state, 1);
    expect(JSON.stringify(state)).toBe(snapshot);
    expect(result.state).not.toBe(state);
    result.state.guardians[0].position.x = 999;
    result.state.powers[0].x = 999;
    result.state.pills.length = 0;
    expect(JSON.stringify(createGame(42))).toBe(snapshot);
    const other = createGame(42);
    other.player.position.x = 999;
    expect(PLAYER_START.x).toBe(1);
  });

  it('semillas y PRNG reproducibles, sin Math.random ni estado global', () => {
    const a = createGame(42);
    const b = createGame(42);
    expect(createGame(43).rngState).not.toBe(a.rngState);
    let sa = a, sb = b;
    for (let i = 0; i < 100; i++) {
      sa = step(sa, (i % 4) as Action).state;
      sb = step(sb, (i % 4) as Action).state;
    }
    expect(sa).toEqual(sb);
    function sequence(seed: number) {
      const values = [];
      for (let i = 0; i < 100; i++) { const next = nextRandom(seed); seed = next.state; values.push(next.value); }
      return values;
    }
    expect(sequence(42)).toEqual(sequence(42));
    expect(sequence(42)).not.toEqual(sequence(43));
    const zero = sequence(0);
    expect(new Set(zero).size).toBe(100);
    zero.forEach(n => { expect(n).toBeGreaterThanOrEqual(0); expect(n).toBeLessThan(1); });
    expect(() => createGame(NaN)).toThrow();
    expect(() => createGame(Infinity)).toThrow();
    expect(() => createGame(0.5)).toThrow();
  });
});
