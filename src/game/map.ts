import type { Position } from './contracts';

export const WIDTH = 19;
export const HEIGHT = 15;
/** Laberinto original de Lúmina, diseñado para este repositorio. # muro, . camino. */
export const MAP: readonly string[] = Object.freeze([
  '###################',
  '#........#........#',
  '#.##.###.#.###.##.#',
  '#....#.......#....#',
  '###..#.#.#.#.#..###',
  '#....#.#...#.#....#',
  '#.##...#####...##.#',
  '#.................#',
  '#.###.#.###.#.###.#',
  '#.....#.....#.....#',
  '###.#.###.###.#.###',
  '#...#.........#...#',
  '#.#.###.#.#.###.#.#',
  '#.......#.#.......#',
  '###################',
]);
export const PLAYER_START: Readonly<Position> = Object.freeze({ x: 1, y: 1 });
export const GUARDIAN_STARTS: readonly Readonly<Position>[] = Object.freeze([
  Object.freeze({ x: 17, y: 1 }), Object.freeze({ x: 1, y: 13 }),
  Object.freeze({ x: 17, y: 13 }), Object.freeze({ x: 9, y: 7 }),
]);
export const POWER_STARTS: readonly Readonly<Position>[] = Object.freeze([
  Object.freeze({ x: 3, y: 1 }), Object.freeze({ x: 15, y: 1 }),
  Object.freeze({ x: 3, y: 13 }), Object.freeze({ x: 15, y: 13 }),
]);

export function isWalkable({ x, y }: Readonly<Position>): boolean {
  return Number.isInteger(x) && Number.isInteger(y) &&
    x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT && MAP[y][x] === '.';
}
