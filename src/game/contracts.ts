/** Contrato serializable compartido; sin dependencias de Phaser ni Node. */
export type Action = 0 | 1 | 2 | 3; // arriba, derecha, abajo, izquierda
export interface Position { x: number; y: number }
export interface Actor { position: Position; direction: Action }
export type GuardianId = 1 | 2 | 3 | 4;
export interface Guardian extends Actor {
  id: GuardianId;
  active: boolean;
  respawnRemaining: number;
}
export type Phase = 'scatter' | 'chase';
export type GameStatus = 'running' | 'won' | 'lost' | 'timeout';
export interface GameState {
  schemaVersion: 1;
  rulesVersion: string;
  mapVersion: string;
  /** Semilla normalizada y estado uint32 del generador; cero es válido. */
  seed: number;
  rngState: number;
  tick: number;
  player: Actor;
  /** Orden estable por id ascendente. Vulnerabilidad: active && powerRemaining > 0. */
  guardians: Guardian[];
  /** Orden inicial fila/columna; recoger elimina el elemento, sin reordenar. */
  pills: Position[];
  powers: Position[];
  points: number;
  lives: number;
  phase: Phase;
  phaseRemaining: number;
  powerRemaining: number;
  captureChain: number;
  status: GameStatus;
}
/** Eventos en orden de resolución del paso; consumo exclusivo de presentación. */
export type GameEvent =
  | { type: 'move'; actor: 'player' | GuardianId; from: Position; to: Position }
  | { type: 'pill' | 'power'; position: Position; points: number }
  | { type: 'capture'; guardianId: GuardianId; points: number }
  | { type: 'death'; lives: number }
  | { type: 'phase'; phase: Phase }
  | { type: 'end'; status: Exclude<GameStatus, 'running'> };
export interface StepResult { state: GameState; events: GameEvent[] }

export const RULES_VERSION = 'lumina-rules-1';
export const MAP_VERSION = 'lumina-map-1';
export const STEP_MS = 100;
