import Phaser from 'phaser';

/** Las capas pertenecen a la escena: se eliminan también al apagarla. */
export function layer(scene: Phaser.Scene, className: string): HTMLDivElement {
  const element = document.createElement('div');
  element.className = `game-layer ${className}`;
  document.getElementById('game')!.append(element);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => element.remove());
  return element;
}
export function background(scene: Phaser.Scene) {
  scene.add.image(800, 450, 'background').setDisplaySize(1600, 900);
}
export function playButton(card: HTMLElement, label: string, action: () => void) {
  const button = document.createElement('button');
  button.textContent = label;
  button.addEventListener('click', () => { button.disabled = true; action(); }, { once: true });
  card.append(button);
}

export class BaseScene extends Phaser.Scene {
  constructor() { super('BaseScene'); }
  create() {
    background(this);
    const card = layer(this, 'game-card');
    const text = document.createElement('p');
    text.textContent = 'Atrapa cada estrella antes de que desaparezca. Tres fallos terminan la partida.';
    card.append(text);
    playButton(card, 'Jugar', () => this.scene.start('LaunchScene'));
  }
}
