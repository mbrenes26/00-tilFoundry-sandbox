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
  /** Generación de la partida; cambia al reiniciar para invalidar trabajo pendiente. */
  readonly sessionId: number;
  readonly status: 'playing' | 'finished';
  readonly score: number;
  readonly misses: number;
  readonly star: Star | null;
  readonly processedEventIds: readonly string[];
}

/** Identidades tomadas al recibir el evento, no al procesarlo después. */
export interface CaptureInput extends Point {
  readonly eventId: string;
  readonly sessionId: number;
  readonly starId: number;
}

/** Tiempo activo acumulado y muestra del reloj monotónico externo. */
export interface GameClock {
  readonly activeMs: number;
  readonly sampledAt: number;
  readonly paused: boolean;
}
