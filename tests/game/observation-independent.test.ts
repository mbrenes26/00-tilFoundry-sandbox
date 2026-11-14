import { describe, expect, it } from 'vitest';
import { createGame, legalActions, observe, step } from '../../src/game/engine';
import type { Action, GameState, Position } from '../../src/game/contracts';
import { MAP, HEIGHT, WIDTH, GUARDIAN_STARTS } from '../../src/game/map';

const offsets = [[0, -1], [1, 0], [0, 1], [-1, 0]] as const;
const key = (p: Position) => `${p.x},${p.y}`;
const cells = MAP.flatMap((row, y) => [...row].flatMap((c, x) => c === '.' ? [{ x, y }] : []));

// Oráculo independiente sobre el mapa: recorrido por capas, sin usar el BFS del motor.
function distance(from: Position, to: Position): number {
  const visited = new Set([key(from)]);
  let layer = [from];
  for (let depth = 0; layer.length; depth++) {
    const next: Position[] = [];
    for (const p of layer) {
      if (key(p) === key(to)) return depth;
      for (const [dx, dy] of offsets) {
        const n = { x: p.x + dx, y: p.y + dy };
        if (MAP[n.y]?.[n.x] === '.' && !visited.has(key(n))) {
          visited.add(key(n)); next.push(n);
        }
      }
    }
    layer = next;
  }
  throw new Error('Objeto inaccesible en mapa conectado');
}

function expectedOffset(origin: Position, objects: Position[]): number[] {
  if (!objects.length) return [0, 0];
  const winner = [...objects].sort((a, b) => distance(origin, a) - distance(origin, b) || a.y - b.y || a.x - b.x)[0];
  return [(winner.x - origin.x) / WIDTH, (winner.y - origin.y) / HEIGHT];
}
const json = (state: GameState): GameState => JSON.parse(JSON.stringify(state)) as GameState;

describe('M-4: comprobación independiente', () => {
  it('compara distancias y desempates de todos los orígenes con oráculo de mapa, sin consumir PRNG', () => {
    const s = createGame(987);
    const objects = [{ x: 1, y: 1 }, { x: 17, y: 1 }, { x: 3, y: 13 }, { x: 15, y: 13 }, { x: 9, y: 7 }];
    s.pills = objects.slice(); s.powers = [...objects].reverse();
    for (const origin of cells) {
      s.player.position = origin;
      const before = JSON.stringify(s);
      const values = observe(s);
      expect(values).toHaveLength(36);
      expect(values.slice(26, 30)).toEqual([...expectedOffset(origin, objects), ...expectedOffset(origin, objects)]);
      expect(values.slice(22, 26)).toEqual(offsets.map(([dx, dy]) => Number(MAP[origin.y + dy]?.[origin.x + dx] === '.')));
      expect(values.every(n => Number.isFinite(n) && n >= -1 && n <= 1)).toBe(true);
      expect(JSON.stringify(s)).toBe(before);
    }
  });

  it('inactivo ignora incluso posición desplazada y poder activo, sin cambiar estado ni semilla', () => {
    const s = createGame(98);
    s.powerRemaining = 1;
    s.guardians[2].active = false;
    s.guardians[2].position = { x: 5, y: 1 };
    s.guardians[2].respawnRemaining = 1;
    const before = JSON.stringify(s);
    expect(observe(s).slice(10, 14)).toEqual([GUARDIAN_STARTS[2].x / WIDTH, GUARDIAN_STARTS[2].y / HEIGHT, 0, 0]);
    expect(JSON.stringify(s)).toBe(before);
  });

  it('JSON nativo entre todos los pasos conserva eventos, observaciones, fases y terminales en varias semillas', () => {
    for (const seed of [0, 1, 4294967295]) {
      let a = createGame(seed);
      // Fuerza capturas y reapariciones con poder, además del recorrido con semillas diferentes.
      a.player.position = { x: 4, y: 1 };
      a.powers = [{ x: 5, y: 1 }];
      a.guardians[0].position = { x: 6, y: 1 };
      a.guardians[0].direction = 3;
      a.phaseRemaining = 1;
      let b = json(a);
      for (let t = 0; t < 340; t++) {
        const legal = legalActions(a);
        const action: Action = t === 0 ? 1 : legal[(t + Math.floor(t / 7)) % legal.length];
        b = json(b);
        expect(b).toEqual(a);
        const aa = step(a, action), bb = step(b, action);
        expect(bb.events).toEqual(aa.events);
        expect(bb.state).toEqual(aa.state);
        expect(observe(bb.state)).toEqual(observe(aa.state));
        a = aa.state; b = bb.state;
      }
      // Un fixture nuevo evita que una partida perdida antes del límite impida probar timeout.
      const nearLimit = createGame(seed);
      nearLimit.tick = 2999;
      nearLimit.guardians.forEach(g => { g.active = false; g.respawnRemaining = 20; });
      const aa = step(nearLimit, 0), bb = step(json(nearLimit), 0);
      expect(bb).toEqual(aa);
      expect(bb.state.status).toBe('timeout');
      expect(observe(bb.state)).toEqual(observe(aa.state));
      expect(step(json(aa.state), 1)).toEqual(step(aa.state, 1));
    }
  });
});
