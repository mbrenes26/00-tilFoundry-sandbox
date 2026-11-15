import Phaser from 'phaser';
import { background, layer, playButton } from './BaseScene';

export class ResultScene extends Phaser.Scene {
  constructor() { super('ResultScene'); }
  create(data: { score: number }) {
    background(this);
    const card = layer(this, 'game-card');
    const title = document.createElement('h2');
    title.textContent = 'Partida terminada';
    const score = document.createElement('p');
    score.textContent = `Puntaje final: ${data.score}`;
    card.append(title, score);
    playButton(card, 'Jugar otra vez', () => this.scene.start('LaunchScene'));
  }
}
