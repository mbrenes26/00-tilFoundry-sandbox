export interface Point {
  readonly x: number;
  readonly y: number;
}

/** Área libre de indicadores y controles, en coordenadas lógicas. */
export interface PlayArea extends Point {
  readonly width: number;
  readonly height: number;
}

/** El gráfico y su zona visible ocupan este cuadrado, centrado en x, y. */
export interface StarZone extends Point {
  readonly size: number;
}

export interface Star extends StarZone {
  readonly id: number;
  readonly startedAt: number;
  readonly durationMs: number;
}

export interface GameConfig {
  readonly area: PlayArea;
  readonly starSize: number;
}

export type RandomSource = () => number;

export interface GameState {
  readonly config: GameConfig;
  readonly status: 'playing' | 'finished';
  readonly score: number;
  readonly misses: number;
  readonly star: Star | null;
  readonly processedEventIds: readonly string[];
}

/** Id único por evento físico; starId identifica lo que se vio al recibirlo. */
export interface CaptureInput extends Point {
  readonly eventId: string;
  readonly starId: number;
}
