import Phaser from 'phaser';
import type { GameState } from '../game/contracts';
import { STATE_PRESENTED, element } from '../ui/presentation';
import type { BaseScene } from './BaseScene';

export class UIScene extends Phaser.Scene {
  progress = { value: 0 };
  private fill!: Phaser.GameObjects.Rectangle;
  constructor() { super('UIScene'); }
  create(): void {
    const hud = element('hud');
    hud.innerHTML = ['points', 'lives', 'phase', 'power', 'steps'].map(id => `<span data-testid="${id}"></span>`).join('');
    this.add.text(960, 768, 'RECORRIDO · LÍMITE DE 3000 PASOS', { fontFamily: 'monospace', fontSize: '18px', color: '#9cafc6' });
    this.add.rectangle(960, 807, 530, 12, 0x28394b).setOrigin(0, 0.5);
    this.fill = this.add.rectangle(960, 807, 1, 12, 0xa8f5cc).setOrigin(0, 0.5);
    this.game.events.on(STATE_PRESENTED, this.present, this);
    this.present((this.scene.get('BaseScene') as BaseScene).state, false);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.game.events.off(STATE_PRESENTED, this.present, this));
  }
  present(state: GameState, animate = true): void {
    const values = { points: `Puntos: ${state.points}`, lives: `Vidas: ${state.lives}`,
      phase: `Fase: ${state.phase === 'scatter' ? 'dispersión' : 'persecución'}`,
      power: `Poder: ${state.powerRemaining} pasos`, steps: `Pasos: ${state.tick} / 3000` };
    for (const [id, value] of Object.entries(values)) {
      const span = element('hud').querySelector(`[data-testid="${id}"]`);
      if (span) span.textContent = value;
    }
    // Display normalization only; terminal decisions remain in the motor.
    const value = Math.min(1, Math.max(0, state.tick / 3000));
    this.tweens.killTweensOf(this.progress);
    const update = () => { this.fill.width = 530 * this.progress.value; };
    if (animate) this.tweens.add({ targets: this.progress, value, duration: 200, onUpdate: update });
    else { this.progress.value = value; update(); }
  }
}
