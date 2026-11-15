import Phaser from 'phaser';

// Arranque HTTP. Las escenas y las reglas se integran en los siguientes pasos.
new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 1600,
  height: 900,
  pixelArt: true,
  backgroundColor: '#18233b',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [],
});
