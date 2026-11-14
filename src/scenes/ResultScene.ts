import Phaser from 'phaser';
import type { GameState } from '../game/contracts';
import { indicators, textStyle } from '../ui/presentation';
export class ResultScene extends Phaser.Scene {
  summary!: Phaser.GameObjects.Text;
  constructor() { super('ResultScene'); }
  create(state: GameState): void {
    if (!state || state.status === 'running') { this.scene.stop(); return; }
    this.add.rectangle(485, 450, 800, 470, 0x101d2c, .97).setStrokeStyle(3, 0xb4dc82);
    const title = { won: 'Laberinto completado', lost: 'Sin vidas', timeout: 'Límite de pasos' }[state.status];
    this.summary = this.add.text(145, 285, `${title}\n\n${indicators(state)}`, { ...textStyle, fontSize: '28px' });
    this.add.text(145, 625, 'Fin de la partida · Sin garantía de aprendizaje', { ...textStyle, fontSize: '20px', color: '#aabcc9' });
  }
}
