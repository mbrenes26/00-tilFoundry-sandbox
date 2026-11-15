import { describe, it, expect } from 'vitest';
import { mkdtemp, open, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createTrainingState, advanceTraining, toCheckpoint, validateCheckpoint, CHECKPOINT_MAX_BYTES } from '../../src/learning/checkpoint';
import { createNetwork } from '../../src/learning/network';
import { toPolicy } from '../../src/learning/policy';
import { validatePolicy, POLICY_MAX_BYTES, utf8Bytes } from '../../src/learning/policy-format';
import { defaultFileOperations, loadCheckpoint, loadPolicy, savePolicy, type FileOperations } from '../../src/learning/files';

describe('endurecimiento de validación y E/S', () => {
  it('política solo inferencia: rechaza campos fuera del schema incluso anidados', () => {
    const p = toPolicy(createNetwork(1), { seed: 1, trainingSteps: 0, updates: 0 });
    expect(() => validatePolicy({ ...p, replay: [] })).toThrow();
    expect(() => validatePolicy({ ...p, metadata: { ...p.metadata, secret: 1 } })).toThrow();
  });
  it('checkpoint rechaza campos desconocidos y arquitectura objetivo incompatible', () => {
    const c = toCheckpoint(createTrainingState(1));
    expect(() => validateCheckpoint({ ...c, config: { ...c.config, unknown: 1 } })).toThrow();
    expect(() => validateCheckpoint({ ...c, architecture: { ...c.architecture, input: 35 } })).toThrow();
    expect(() => validateCheckpoint({ ...c, exploration: { ...c.exploration, decaySteps: 9 } })).toThrow();
  });
  it.each([0, 2, 18, 22, 30])('replay usado respeta rango [0,1] en entrada %s, no solo [-1,1]', index => {
    const s = createTrainingState(1); advanceTraining(s); const c = toCheckpoint(s);
    c.replay.observations[index] = -.5;
    expect(() => validateCheckpoint(c)).toThrow();
  });
  it.each([4, 5, 18, 22, 32])('replay usado respeta booleanos en entrada %s', index => {
    const s = createTrainingState(1); advanceTraining(s); const c = toCheckpoint(s);
    c.replay.nextObservations[index] = .5;
    expect(() => validateCheckpoint(c)).toThrow();
  });
  it('tamaño UTF-8 coincide con bytes Node incluidos pares y surrogates aislados', () => {
    for (const text of ['ascii', 'é中🚀', '\ud800', '\udfff', '\ud800a\udfff', '\ud800\ud800\udfff'])
      expect(utf8Bytes(text)).toBe(Buffer.byteLength(text, 'utf8'));
  });
  it('límites reales con archivos temporales dispersos y UTF-8 inválido', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'lumina-limit-'));
    try {
      for (const [name, limit, load] of [['policy', POLICY_MAX_BYTES, loadPolicy], ['checkpoint', CHECKPOINT_MAX_BYTES, loadCheckpoint]] as const) {
        const path = join(dir, name), handle = await open(path, 'w'); await handle.truncate(limit + 1); await handle.close();
        await expect(load(path)).rejects.toThrow(/tamaño máximo/);
      }
      const invalid = join(dir, 'utf8'); await writeFile(invalid, Buffer.from([0xff]));
      await expect(loadPolicy(invalid)).rejects.toThrow(/leer/);
    } finally { await rm(dir, { recursive: true, force: true }); }
  });
  it('fallo de open/close/read mantiene el destino válido', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'lumina-failure-'));
    try {
      const path = join(dir, 'policy.json'), p = toPolicy(createNetwork(1), { seed: 1, trainingSteps: 0, updates: 0 });
      await savePolicy(path, p); const before = await readFile(path, 'utf8');
      const denied = async () => { throw new Error('permiso denegado'); };
      await expect(savePolicy(path, p, { ...defaultFileOperations, open: denied })).rejects.toThrow(/guardar/);
      let calls = 0;
      const fs: FileOperations = { ...defaultFileOperations, open: async (...args) => {
        const handle = await defaultFileOperations.open(...args);
        return { writeFile: handle.writeFile.bind(handle), sync: handle.sync.bind(handle), close: async () => {
          if (calls++ === 0) throw new Error('fallo al cerrar'); await handle.close();
        } };
      } };
      await expect(savePolicy(path, p, fs)).rejects.toThrow(/guardar/);
      await expect(loadPolicy(path, { ...defaultFileOperations, readFile: denied })).rejects.toThrow(/leer/);
      expect(await readFile(path, 'utf8')).toBe(before); expect(await loadPolicy(path)).toEqual(p);
    } finally { await rm(dir, { recursive: true, force: true }); }
  });
});
