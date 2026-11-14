import Phaser from 'phaser';
import type { GameState, Position } from '../game/contracts';
import { STEP_MS } from '../game/contracts';
import { createGame } from '../game/engine';
import { MAP } from '../game/map';
import { STATE_PRESENTED } from '../ui/presentation';

/** Drawing only. The initial state is an explicitly labelled, stationary map preview. */
export class BaseScene extends Phaser.Scene {
  ready = false;
  state!: GameState;
  playerSprite!: Phaser.GameObjects.Sprite;
  private guardians: Phaser.GameObjects.Sprite[] = [];
  private objects!: Phaser.GameObjects.Group;
  private rhythm?: Phaser.Time.TimerEvent;
  constructor() { super('BaseScene'); }
  cellCenter(position: Position): { x: number; y: number } {
    return { x: 80 + position.x * 40 + 20, y: 160 + position.y * 40 + 20 };
  }
  create(): void {
    this.add.text(80, 112, 'EL JARDÍN DE LOS ECOS', { fontFamily: 'monospace', fontSize: '24px', color: '#a8f5cc' });
    MAP.forEach((row, y) => [...row].forEach((tile, x) => {
      const center = this.cellCenter({ x, y });
      this.add.image(center.x, center.y, 'tiles', tile === '#' ? 0 : 1).setDisplaySize(40, 40);
    }));
    this.objects = this.add.group();
    this.playerSprite = this.add.sprite(0, 0, 'actors', 0).setScale(2).setDepth(2).play('lumina-flutter');
    this.guardians = [1, 2, 3, 4].map(id => this.add.sprite(0, 0, 'actors', id * 2).setScale(2).setDepth(2).play(`guardian-${id}`));
    this.present(createGame(42), false);
    this.ready = true;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.stopRhythm(); this.ready = false; });
  }
  present(state: GameState, animate = true): void {
    this.state = structuredClone(state);
    this.objects.clear(true, true);
    state.pills.forEach(p => { const c = this.cellCenter(p); this.objects.add(this.add.image(c.x, c.y, 'tiles', 2).setScale(2)); });
    state.powers.forEach(p => { const c = this.cellCenter(p); this.objects.add(this.add.image(c.x, c.y, 'tiles', 3).setScale(2)); });
    const move = (sprite: Phaser.GameObjects.Sprite, position: Position) => {
      this.tweens.killTweensOf(sprite);
      const center = this.cellCenter(position);
      if (animate) this.tweens.add({ targets: sprite, ...center, duration: STEP_MS * 0.8 });
      else sprite.setPosition(center.x, center.y);
    };
    move(this.playerSprite, state.player.position);
    state.guardians.forEach(g => {
      const sprite = this.guardians[g.id - 1];
      sprite.setVisible(g.active);
      sprite.play(g.active && state.powerRemaining > 0 ? 'guardian-vulnerable' : `guardian-${g.id}`, true);
      move(sprite, g.position);
    });
    this.game.events.emit(STATE_PRESENTED, this.state, animate);
  }
  /** The caller owns simulation. This timer supplies presentation cadence only. */
  setRhythm(onPulse: () => void, delay = STEP_MS): void {
    this.stopRhythm();
    this.rhythm = this.time.addEvent({ delay, loop: true, callback: onPulse });
  }
  stopRhythm(): void { this.rhythm?.remove(false); this.rhythm = undefined; }
}
