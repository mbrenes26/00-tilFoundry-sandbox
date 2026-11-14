import Phaser from 'phaser';
import {BootScene,BaseScene,UIScene,LaunchScene,ResultScene} from './game/scenes';
import './styles/game.css';
const game=new Phaser.Game({type:Phaser.CANVAS,parent:'app',width: 1600,height: 900,pixelArt: true,roundPixels:true,backgroundColor:'#0a1326',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},dom:{createContainer:true},scene:[BootScene,BaseScene,UIScene,LaunchScene,ResultScene]});
// Observabilidad de Phaser para las pruebas: nunca se inyecta ni sustituye estado de reglas.
Object.defineProperty(window,'__game',{value:game,writable:false});
