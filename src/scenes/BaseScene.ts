import Phaser from 'phaser';
import type { GameState, Position } from '../game/contracts';
import { STEP_MS } from '../game/contracts';
import { createGame } from '../game/engine';
import { MAP } from '../game/map';
const CELL = 44;
const screen = (p: Position) => ({ x: 64 + p.x * CELL + CELL / 2, y: 150 + p.y * CELL + CELL / 2 });
/** Consume GameState; no contiene reglas ni selecciona acciones de jugador. */
export class BaseScene extends Phaser.Scene {
  state!: GameState;
  actors: Phaser.GameObjects.Sprite[] = [];
  objects!: Phaser.GameObjects.Group;
  ambienceTimer!: Phaser.Time.TimerEvent;
  constructor() { super('BaseScene'); }
  create(): void {
    this.state = createGame(42);
    this.actors = [];
    MAP.forEach((row, y) => [...row].forEach((cell, x) => {
      const p = screen({ x, y });
      if (cell === '#') this.add.image(p.x, p.y, 'tiles', 0).setDisplaySize(CELL, CELL);
      else this.add.rectangle(p.x, p.y, CELL, CELL, 0x101e2d);
    }));
    this.objects = this.add.group();
    for (let i = 0; i < 5; i++) this.actors.push(this.add.sprite(0, 0, 'actors', i * 2).setDisplaySize(36, 36).setDepth(2));
    this.present(this.state, 0);
    // Ritmo ambiental de presentación: nunca modifica reloj, PRNG ni estado del motor.
    this.ambienceTimer = this.time.addEvent({ delay: STEP_MS, loop: true, callback: () => {
      for (const item of this.objects.getChildren() as Phaser.GameObjects.Image[]) {
        if (String(item.frame.name) === '2') item.setAlpha(.8 + .2 * Math.sin(this.time.now / 300));
      }
    } });
  }
  present(state: GameState, duration = STEP_MS): void {
    this.state = state;
    this.objects.clear(true, true);
    for (const [positions, frame] of [[state.pills, 1], [state.powers, 2]] as const) {
      for (const position of positions) {
        const p = screen(position);
        this.objects.add(this.add.image(p.x, p.y, 'tiles', frame).setDisplaySize(CELL, CELL));
      }
    }
    const models = [state.player, ...state.guardians];
    models.forEach((actor, index) => {
      const sprite = this.actors[index];
      this.tweens.killTweensOf(sprite);
      const p = screen(actor.position);
      if (duration === 0) sprite.setPosition(p.x, p.y);
      else this.tweens.add({ targets: sprite, x: p.x, y: p.y, duration, ease: 'Linear' });
      sprite.setVisible(index === 0 || state.guardians[index - 1].active);
      const animation = `flutter-${index > 0 && state.powerRemaining > 0 ? 5 : index}`;
      if (sprite.anims.currentAnim?.key !== animation) sprite.play(animation);
    });
    this.game.events.emit('state-presented', state);
    if (state.status !== 'running') this.scene.run('ResultScene', state);
  }
}
