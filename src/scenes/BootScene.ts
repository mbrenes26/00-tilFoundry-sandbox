import Phaser from 'phaser';
export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  preload(): void {
    this.load.spritesheet('tiles', 'assets/tiles.svg', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('actors', 'assets/actors.svg', { frameWidth: 16, frameHeight: 16 });
  }
  create(): void {
    for (let i = 0; i < 6; i++) this.anims.create({ key: `flutter-${i}`,
      frames: this.anims.generateFrameNumbers('actors', { start: i * 2, end: i * 2 + 1 }), frameRate: 5, repeat: -1 });
    this.scene.start('BaseScene');
    this.scene.launch('UIScene');
    this.scene.launch('LaunchScene');
  }
}
