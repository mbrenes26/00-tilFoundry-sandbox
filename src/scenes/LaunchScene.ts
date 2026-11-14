import Phaser from 'phaser';
import { STEP_MS } from '../game/contracts';
import { checkBytes, parsePolicy, POLICY_MAX_BYTES } from '../learning/policy-format';
import type { PolicyV1 } from '../learning/policy';
import { Playback, validSeed } from '../ui/playback';
import { element } from '../ui/presentation';
import type { BaseScene } from './BaseScene';

export class LaunchScene extends Phaser.Scene {
  policy?: PolicyV1;
  playback?: Playback;
  private importId = 0;
  private base!: BaseScene;
  constructor() { super('LaunchScene'); }
  create(): void {
    this.base = this.scene.get('BaseScene') as BaseScene;
    const panel = element('launch-panel');
    panel.hidden = false;
    element('result-panel').hidden = true;
    panel.innerHTML = `<h2>Observa una red neuronal</h2>
      <p>La política importada decide con la red neuronal compartida. Aquí no aprende ni explora.</p>
      <div id="import-controls">
        <label for="policy-file">Importar política JSON</label>
        <button id="select-file" type="button">Seleccionar archivo JSON</button>
        <input id="policy-file" type="file" accept=".json,application/json" hidden>
        <p id="policy-message" role="status" aria-live="polite">Ningún archivo seleccionado</p>
        <label for="seed">Semilla de partida</label>
        <input id="seed" type="number" min="0" max="4294967295" step="1" value="42">
        <p id="seed-message" aria-live="polite"></p>
        <button id="start" type="button" disabled>Iniciar partida</button>
      </div>
      <div id="playback-controls" hidden>
        <p id="playback-note"></p>
        <button id="pause" type="button">Pausar</button>
        <label for="speed">Velocidad</label>
        <select id="speed"><option value="1">1×</option><option value="4">4×</option></select>
        <button id="restart" type="button">Reiniciar</button>
        <button id="change-policy" type="button">Importar otra política</button>
      </div>
      <p>Política inicial o archivo de prueba no equivale a red entrenada. Una partida no demuestra mejora.</p>`;
    const fileInput = element('policy-file') as HTMLInputElement;
    element('select-file').onclick = () => fileInput.click();
    fileInput.onchange = () => { void this.importFile(fileInput.files?.[0]); };
    (element('seed') as HTMLInputElement).oninput = () => this.updateStart();
    element('start').onclick = () => this.startPlayback();
    element('pause').onclick = () => {
      if (!this.playback) return;
      this.playback.paused = !this.playback.paused;
      this.updatePause(); this.schedule();
    };
    (element('speed') as HTMLSelectElement).onchange = () => {
      if (!this.playback) return;
      this.playback.speed = (element('speed') as HTMLSelectElement).value === '4' ? 4 : 1;
      this.schedule();
    };
    element('restart').onclick = () => this.restart();
    element('change-policy').onclick = () => {
      this.base.stopRhythm(); this.playback = undefined;
      element('import-controls').hidden = false;
      element('playback-controls').hidden = true;
      this.updateStart();
    };
    this.updateStart();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.importId++; this.base.stopRhythm(); });
  }
  private updateStart(): void {
    const seed = validSeed((element('seed') as HTMLInputElement).value);
    element('seed-message').textContent = seed === undefined ? 'La semilla debe ser un entero entre 0 y 4294967295.' : '';
    (element('start') as HTMLButtonElement).disabled = !this.policy || seed === undefined;
  }
  private async importFile(file?: File): Promise<void> {
    const id = ++this.importId;
    // Immediately revoke authorization while reading, including after a previous valid import.
    this.policy = undefined; this.updateStart();
    const message = element('policy-message');
    if (!file) { message.textContent = 'Ningún archivo seleccionado'; return; }
    message.textContent = 'Validando política…';
    try {
      checkBytes(file.size, POLICY_MAX_BYTES); // BEFORE reading or parsing the file.
      const text = await file.text().catch(() => { throw new Error('No se pudo leer el archivo. Selecciona otra política JSON.'); });
      const policy = parsePolicy(text);
      if (id !== this.importId) return;
      this.policy = policy;
      message.textContent = `Política válida · ${policy.metadata.trainingSteps} pasos declarados · ${policy.metadata.updates} actualizaciones declaradas${policy.metadata.updates === 0 ? ' · política inicial o archivo de prueba, sin entrenamiento' : ' · estos contadores no garantizan aprendizaje'}.`;
    } catch (error) {
      if (id !== this.importId) return;
      message.textContent = error instanceof Error ? error.message : 'No se pudo leer la política. Selecciona otro archivo.';
    }
    this.updateStart();
  }
  private startPlayback(): void {
    const seed = validSeed((element('seed') as HTMLInputElement).value);
    if (!this.policy || seed === undefined) return;
    this.playback = new Playback(this.policy, seed);
    (element('speed') as HTMLSelectElement).value = '1';
    element('import-controls').hidden = true;
    element('playback-controls').hidden = false;
    element('playback-note').textContent = `Semilla: ${seed} · Inferencia sin entrenamiento ni exploración.`;
    this.base.present(this.playback.state, false);
    this.updatePause(); this.schedule();
  }
  private updatePause(): void { element('pause').textContent = this.playback?.paused ? 'Reanudar' : 'Pausar'; }
  private schedule(): void {
    this.base.stopRhythm();
    if (this.playback && !this.playback.paused && this.playback.state.status === 'running')
      this.base.setRhythm(() => this.pulse(), STEP_MS / this.playback.speed);
  }
  pulse(): void {
    if (!this.playback?.advance()) return;
    this.base.present(this.playback.state, true, STEP_MS * .8 / this.playback.speed);
    if (this.playback.state.status !== 'running') {
      this.base.stopRhythm();
      this.scene.launch('ResultScene', { state: this.playback.state });
    }
  }
  restart(): void {
    if (!this.playback) return;
    this.scene.stop('ResultScene');
    element('result-panel').hidden = true;
    element('launch-panel').hidden = false;
    // Retain seed, policy, speed and pause state; a final restarts safely paused.
    if (this.playback.state.status !== 'running') this.playback.paused = true;
    this.playback.restart();
    this.base.present(this.playback.state, false);
    this.updatePause(); this.schedule();
  }
}
