import Phaser from 'phaser';
/** La conexión de PolicyV1 y los controles se incorporan en el siguiente paso. */
export class LaunchScene extends Phaser.Scene {
  constructor() { super('LaunchScene'); }
  create(): void {
    const panel = document.querySelector<HTMLElement>('#launch-panel')!;
    panel.hidden = false;
    panel.innerHTML = `<h1>Observar una política</h1>
      <label for="policy-file">Archivo de política JSON</label>
      <div class="file-picker"><span aria-hidden="true">Seleccionar archivo</span><small aria-hidden="true">Ningún archivo seleccionado</small>
        <input id="policy-file" type="file" accept=".json,application/json" disabled>
      </div>
      <button id="start-game" type="button" disabled>Iniciar partida</button>
      <p role="status">Sin política. Vista inicial del mapa; no es una red entrenada.</p>
      <p>La importación se habilitará al integrar la reproducción de políticas. El entrenamiento se ejecuta por separado en tu equipo.</p>`;
    this.events.once('shutdown', () => { panel.hidden = true; panel.replaceChildren(); });
  }
}
