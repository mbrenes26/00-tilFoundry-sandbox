import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { BaseScene } from './scenes/BaseScene';
import { UIScene } from './scenes/UIScene';
import { LaunchScene } from './scenes/LaunchScene';
import { ResultScene } from './scenes/ResultScene';
import './style.css';

export const game = new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', width: 1600, height: 900,
  backgroundColor: '#0b1220', pixelArt: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, BaseScene, UIScene, LaunchScene, ResultScene],
});
