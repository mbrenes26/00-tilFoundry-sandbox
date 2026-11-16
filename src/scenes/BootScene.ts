import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  preload() {
    this.load.svg('star', 'assets/star.svg');
    this.load.svg('background', 'assets/background.svg');
  }
  create() {
    const texture = this.textures.get('star');
    texture.add(0, 0, 0, 0, 32, 32);
    texture.add(1, 0, 32, 0, 32, 32);
    this.scene.start('BaseScene');
  }
}
