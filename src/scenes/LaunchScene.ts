import Phaser from 'phaser';
import { advanceGame, captureStar, startGame } from '../game/rules';
import { createClock, gameTime, setPaused } from '../game/clock';
import type { GameClock, GameState } from '../game/types';
import { background } from './BaseScene';
import { UIScene } from './UIScene';

export class LaunchScene extends Phaser.Scene {
  private state!: GameState;
  private clock!: GameClock;
  private star!: Phaser.GameObjects.Sprite;
  private progress!: Phaser.GameObjects.Rectangle;
  private deadline?: Phaser.Time.TimerEvent;
  private generation = 0;
  private renderedId = -1;
  private eventIds = new WeakMap<object, string>();
  private sequence = 0;
  constructor() { super('LaunchScene'); }
  create() {
    background(this);
    this.generation++;
    this.eventIds = new WeakMap();
    this.sequence = 0;
    this.renderedId = -1;
    this.clock = createClock(performance.now(), document.hidden);
    this.state = startGame({ area: { x: 112, y: 200, width: 1376, height: 480 }, starSize: 224 }, 0, Math.random, this.generation);
    if (!this.anims.exists('twinkle')) this.anims.create({ key: 'twinkle', frames: [{ key: 'star', frame: 0 }, { key: 'star', frame: 1 }], frameRate: 4, repeat: -1 });
    this.star = this.add.sprite(0, 0, 'star', 0).setDisplaySize(224, 224).play('twinkle');
    this.progress = this.add.rectangle(800, 760, 1000, 16, 0xffcf50);
    this.scene.launch('UIScene');
    const capture = (pointer: Phaser.Input.Pointer) => {
      if (this.clock.paused || !this.state.star) return;
      let eventId = this.eventIds.get(pointer.event);
      if (!eventId) { eventId = String(++this.sequence); this.eventIds.set(pointer.event, eventId); }
      this.state = captureStar(this.state, {
        x: pointer.x, y: pointer.y, eventId,
        sessionId: this.state.sessionId, starId: this.state.star.id,
      }, gameTime(this.clock, performance.now()), Math.random);
      this.render();
    };
    const visibility = () => {
      this.clock = setPaused(this.clock, performance.now(), document.hidden);
      this.tweens.getTweensOf(this.progress).forEach(tween => document.hidden ? tween.pause() : tween.resume());
      this.render();
    };
    this.input.on('pointerdown', capture);
    document.addEventListener('visibilitychange', visibility);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      document.removeEventListener('visibilitychange', visibility);
      this.input.off('pointerdown', capture);
      this.deadline?.remove(false);
      this.time.removeAllEvents();
      this.tweens.killAll();
      this.scene.stop('UIScene');
      this.eventIds = new WeakMap();
    });
    this.render();
  }
  update() {
    this.state = advanceGame(this.state, gameTime(this.clock, performance.now()), Math.random);
    this.render();
  }
  private render() {
    if (this.state.status === 'finished') {
      this.star.destroy();
      this.scene.start('ResultScene', { score: this.state.score });
      return;
    }
    (this.scene.get('UIScene') as UIScene).render(this.state, this.clock.paused);
    const star = this.state.star!;
    if (star.id === this.renderedId) return;
    this.renderedId = star.id;
    this.star.setPosition(star.x, star.y);
    this.tweens.killTweensOf(this.progress);
    this.progress.scaleX = 1;
    this.tweens.add({ targets: this.progress, scaleX: 0, duration: star.durationMs, paused: this.clock.paused });
    this.deadline?.remove(false);
    // El callback y update consultan la misma regla; el tiempo visible es la autoridad.
    this.deadline = this.time.delayedCall(star.durationMs, () => {
      this.state = advanceGame(this.state, gameTime(this.clock, performance.now()), Math.random);
      this.render();
    });
  }
}
