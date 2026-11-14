import Phaser from 'phaser';
import { element, statusTitles, type ResultData } from '../ui/presentation';

export class ResultScene extends Phaser.Scene {
  constructor() { super('ResultScene'); }
  create({ state }: ResultData): void {
    if (!state || state.status === 'running') { this.scene.stop(); return; }
    this.scene.stop('LaunchScene');
    element('launch-panel').hidden = true;
    const panel = element('result-panel');
    panel.hidden = false;
    panel.replaceChildren();
    const title = document.createElement('h2'); title.textContent = statusTitles[state.status];
    const summary = document.createElement('p'); summary.dataset.testid = 'result-summary';
    summary.textContent = `${state.points} puntos · ${state.lives} vidas · ${state.tick} pasos`;
    const note = document.createElement('p'); note.textContent = 'Resumen del estado final recibido del motor. Una partida no demuestra mejora del aprendizaje.';
    panel.append(title, summary, note);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { panel.hidden = true; });
  }
}
