import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  preload(): void {
    this.load.spritesheet('actors', 'assets/actors.svg', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('tiles', 'assets/tiles.svg', { frameWidth: 16, frameHeight: 16 });
  }
  create(): void {
    const names = ['lumina-flutter', 'guardian-1', 'guardian-2', 'guardian-3', 'guardian-4', 'guardian-vulnerable'];
    names.forEach((key, i) => {
      if (!this.anims.exists(key)) this.anims.create({ key,
        frames: this.anims.generateFrameNumbers('actors', { start: i * 2, end: i * 2 + 1 }),
        frameRate: 5, repeat: -1 });
    });
    this.scene.start('BaseScene');
    this.scene.launch('UIScene');
    this.scene.launch('LaunchScene');
  }
}
