import Phaser from 'phaser';
import type { GameState } from '../game/contracts';
import { indicators, textStyle } from '../ui/presentation';
import { BaseScene } from './BaseScene';
export class UIScene extends Phaser.Scene {
  summary!: Phaser.GameObjects.Text;
  progress!: Phaser.GameObjects.Rectangle;
  constructor() { super('UIScene'); }
  create(): void {
    this.add.rectangle(1255, 455, 540, 800, 0x111f30).setStrokeStyle(2, 0x284457);
    this.add.text(64, 40, 'LÚMINA', { ...textStyle, fontSize: '44px', color: '#dcf3a3' });
    this.add.text(66, 100, 'GUARDIANES DEL LABERINTO  /  UN EXPERIMENTO LOCAL', { ...textStyle, fontSize: '18px', color: '#91aab9' });
    this.add.text(1024, 95, 'ESTADO DE LA PARTIDA', { ...textStyle, fontSize: '20px', color: '#91aab9' });
    this.summary = this.add.text(1024, 145, '', textStyle);
    this.add.text(1024, 370, 'Progreso del reloj simulado', { ...textStyle, fontSize: '18px', color: '#91aab9' });
    this.add.rectangle(1024, 415, 450, 10, 0x263c4f).setOrigin(0, .5);
    this.progress = this.add.rectangle(1024, 415, 450, 10, 0xb4dc82).setOrigin(0, .5).setScale(0, 1);
    this.present((this.scene.get('BaseScene') as BaseScene).state);
    this.game.events.on('state-presented', this.present, this);
    this.events.once('shutdown', () => this.game.events.off('state-presented', this.present, this));
  }
  present(state: GameState): void {
    this.summary.setText(indicators(state));
    this.tweens.killTweensOf(this.progress);
    this.tweens.add({ targets: this.progress, scaleX: state.tick / 3000, duration: 100 });
  }
}
