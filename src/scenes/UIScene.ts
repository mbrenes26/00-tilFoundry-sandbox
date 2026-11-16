import Phaser from 'phaser';
import type { GameState } from '../game/types';
import { layer } from './BaseScene';

export class UIScene extends Phaser.Scene {
  private points!: HTMLSpanElement;
  private misses!: HTMLSpanElement;
  private note!: HTMLDivElement;
  constructor() { super('UIScene'); }
  create() {
    const hud = layer(this, 'game-hud');
    this.points = document.createElement('span');
    this.misses = document.createElement('span');
    this.note = document.createElement('div');
    this.note.className = 'game-note';
    hud.setAttribute('aria-live', 'polite');
    hud.append(this.points, this.misses, this.note);
  }
  render(state: GameState, paused: boolean) {
    // launch se procesa al terminar la actualización de escenas.
    if (!this.points) return;
    this.points.textContent = `Puntos: ${state.score}`;
    this.misses.textContent = `Fallos: ${state.misses} / 3`;
    this.note.textContent = paused ? 'Partida en pausa' : 'Haz clic o toca la estrella';
  }
}
