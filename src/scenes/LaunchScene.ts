import Phaser from 'phaser';
import { element } from '../ui/presentation';

/** Import/start structure only; validation and execution belong to step 10. */
export class LaunchScene extends Phaser.Scene {
  constructor() { super('LaunchScene'); }
  create(): void {
    const panel = element('launch-panel');
    panel.hidden = false;
    element('result-panel').hidden = true;
    panel.innerHTML = `<h2>Observa una red neuronal</h2>
      <p>Vista previa del mapa · Sin política cargada</p>
      <p>La luciérnaga Lúmina recorre este laberinto junto a cuatro guardianes. Esta vista no ejecuta una partida.</p>
      <label for="policy-file">Importar política JSON</label>
      <div style="position:relative; margin-bottom:16px">
        <input id="policy-file" type="file" accept=".json,application/json" disabled style="position:absolute;inset:0;opacity:0;height:100%;padding:0">
        <button type="button" disabled aria-hidden="true">Seleccionar archivo JSON</button>
      </div>
      <p>Ningún archivo seleccionado</p>
      <button type="button" disabled>Iniciar partida</button>
      <p>Importación y reproducción pendientes de integrar. No hay una red entrenada cargada ni un jugador sustituto.</p>`;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { panel.hidden = true; });
  }
}
