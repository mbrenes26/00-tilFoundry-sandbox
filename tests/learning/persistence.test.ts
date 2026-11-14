import { describe, it, expect, vi } from 'vitest';
import { mkdtemp, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createNetwork } from '../../src/learning/network';
import { chooseAction, toPolicy } from '../../src/learning/policy';
import { parsePolicy, serializePolicy, validatePolicy, POLICY_MAX_BYTES } from '../../src/learning/policy-format';
import { createTrainingState, advanceTraining, toCheckpoint, restoreCheckpoint, parseCheckpoint, serializeCheckpoint, validateCheckpoint, CHECKPOINT_MAX_BYTES } from '../../src/learning/checkpoint';
import { savePolicy, loadPolicy, saveCheckpoint, loadCheckpoint, type FileOperations } from '../../src/learning/files';
import { observe, legalActions } from '../../src/game/engine';

const policy = () => toPolicy(createNetwork(17), { seed: 17, trainingSteps: 0, updates: 0 });
const checkpoint = () => toCheckpoint(createTrainingState(17, 42));
const copy = <T>(v: T): T => structuredClone(v);

describe('PolicyV1 compartida y límites por bytes', () => {
  it('roundtrip conserva inferencia y no muta pesos', () => {
    const p = policy(), text = serializePolicy(p), loaded = parsePolicy(text);
    expect(loaded).toEqual(p);
    const state = createTrainingState(17, 42).game;
    expect(chooseAction(loaded, observe(state), legalActions(state))).toBe(chooseAction(p, observe(state), legalActions(state)));
    expect(serializePolicy(loaded)).toBe(text);
  });
  it.each([
    ['schema', (p: any) => p.schemaVersion = 2], ['mapa', (p: any) => p.mapVersion = 'otro'],
    ['reglas', (p: any) => p.rulesVersion = 'otras'], ['arquitectura', (p: any) => p.architecture.hidden = 32],
    ['orden', (p: any) => p.architecture.weightOrder = 'input-major'], ['dimensión', (p: any) => p.parameters.b2.pop()],
    ['NaN', (p: any) => p.parameters.w1[0] = NaN], ['infinito', (p: any) => p.parameters.b1[0] = Infinity],
    ['tipo', (p: any) => p.parameters.w2[0] = '1'], ['seed', (p: any) => p.metadata.seed = -1],
    ['contador', (p: any) => p.metadata.trainingSteps = .5], ['coherencia', (p: any) => p.metadata.updates = 1],
  ])('rechaza %s', (_, mutate) => { const p = policy(); mutate(p); expect(() => validatePolicy(p)).toThrow(); expect(() => serializePolicy(p)).toThrow(); });
  it('rechaza corruptos y limita UTF-8 antes de parsear, no caracteres', () => {
    expect(() => parsePolicy('{')).toThrow(/JSON/);
    expect(() => parsePolicy('null')).toThrow();
    const spy = vi.spyOn(JSON, 'parse');
    const tooLarge = 'é'.repeat(POLICY_MAX_BYTES / 2 + 1);
    expect(tooLarge.length).toBeLessThan(POLICY_MAX_BYTES);
    expect(() => parsePolicy(tooLarge)).toThrow(/2 MiB/); expect(spy).not.toHaveBeenCalled(); spy.mockRestore();
  });
});

describe('checkpoint completo de continuidad', () => {
  it('continuo e interrumpido: acciones, dos redes, replay circular, PRNG, contadores, tiempo y motor exactos con SGD real', () => {
    const a = createTrainingState(17, 42);
    for (let i = 0; i < 10003; i++) advanceTraining(a);
    a.activeSeconds = 12.25;
    const initial = policy().parameters.w1;
    expect(Array.from(a.dqn.online.w1)).not.toEqual(initial);
    expect(a.dqn.replay.cursor).toBe(3); expect(a.dqn.replay.size).toBe(10000);
    const snapshot = toCheckpoint(a), b = restoreCheckpoint(parseCheckpoint(serializeCheckpoint(snapshot)));
    expect(toCheckpoint(b)).toEqual(snapshot);
    expect(b.dqn.online.w1).not.toBe(a.dqn.online.w1);
    for (let i = 0; i < 41; i++) {
      expect(advanceTraining(b)).toEqual(advanceTraining(a));
      a.activeSeconds += .1; b.activeSeconds += .1;
    }
    expect(toCheckpoint(b)).toEqual(toCheckpoint(a));
    expect(a.dqn.target).not.toEqual(a.dqn.online);
    expect(a.dqn.updates).toBeGreaterThan(2000);
  }, 120000);
  it('roundtrip vacío y parcial, no comparte arrays ni partida', () => {
    const a = createTrainingState(0, 0); advanceTraining(a);
    const c = toCheckpoint(a), b = restoreCheckpoint(c);
    b.game.player.position.x = 99; b.dqn.replay.observations[0] = 99;
    expect(a.game.player.position.x).not.toBe(99); expect(c.game.player.position.x).not.toBe(99);
    expect(a.dqn.replay.observations[0]).not.toBe(99);
    expect(parseCheckpoint(serializeCheckpoint(checkpoint()))).toEqual(checkpoint());
  });
  it.each([
    ['schema', (c: any) => c.schemaVersion = 2], ['mapa', (c: any) => c.mapVersion = 'otro'],
    ['reglas', (c: any) => c.rulesVersion = 'otro'], ['config', (c: any) => c.config.gamma = .5],
    ['red objetivo', (c: any) => c.target.b2[0] = Infinity], ['red online', (c: any) => c.online.w1.pop()],
    ['PRNG', (c: any) => c.actionRngState = 2 ** 32], ['PRNG lotes', (c: any) => c.rngState = -1],
    ['tiempo', (c: any) => c.activeSeconds = -1], ['contador', (c: any) => c.steps = 1],
    ['actualizaciones', (c: any) => c.updates = 1], ['cursor', (c: any) => c.replay.cursor = 1],
    ['replay', (c: any) => c.replay.actions[0] = 4], ['máscara', (c: any) => c.replay.nextLegalMasks[0] = 16],
    ['terminal', (c: any) => c.replay.terminals[0] = 2], ['observación', (c: any) => c.replay.observations[0] = 2],
    ['recompensa', (c: any) => c.replay.rewards[0] = NaN], ['capacidad', (c: any) => c.replay.capacity = 10001],
    ['dimensión replay', (c: any) => c.replay.rewards.pop()], ['partida', (c: any) => c.game.player.position.x = 0],
    ['versión motor', (c: any) => c.game.rulesVersion = 'otro'], ['vida', (c: any) => c.game.lives = 4],
    ['estado', (c: any) => c.game.status = 'lost'], ['objetos', (c: any) => c.game.pills.push(c.game.pills[0])],
    ['guardián', (c: any) => c.game.guardians[0].active = false], ['temporizador', (c: any) => c.game.phaseRemaining = 500],
    ['episodios', (c: any) => c.episodes = -1],
  ])('rechaza %s', (_, mutate) => { const c = checkpoint(); mutate(c); expect(() => validateCheckpoint(c)).toThrow(); });
  it('límite checkpoint 128 MiB antes de parsear y JSON corrupto', () => {
    expect(() => parseCheckpoint('{')).toThrow(/JSON/);
    const spy = vi.spyOn(JSON, 'parse');
    expect(() => parseCheckpoint(' '.repeat(CHECKPOINT_MAX_BYTES + 1))).toThrow(/128 MiB/);
    expect(spy).not.toHaveBeenCalled(); spy.mockRestore();
  });
});

describe('E/S real Node con temporal y reemplazo', () => {
  async function inDirectory(test: (dir: string) => Promise<void>) {
    const dir = await mkdtemp(join(tmpdir(), 'lumina-')); try { await test(dir); } finally { await rm(dir, { recursive: true, force: true }); }
  }
  it('guarda/carga política y checkpoint reales y sustituye solo tras validar', async () => inDirectory(async dir => {
    const p = join(dir, 'policy.json'), c = join(dir, 'checkpoint.json');
    await savePolicy(p, policy()); expect(await loadPolicy(p)).toEqual(policy());
    const training = createTrainingState(17, 42); advanceTraining(training);
    await saveCheckpoint(c, toCheckpoint(training)); expect(toCheckpoint(await loadCheckpoint(c))).toEqual(toCheckpoint(training));
    const bad = policy(); bad.parameters.b2[0] = NaN;
    await expect(savePolicy(p, bad)).rejects.toThrow(); expect(await loadPolicy(p)).toEqual(policy());
    const badC = toCheckpoint(training); badC.activeSeconds = Infinity;
    await expect(saveCheckpoint(c, badC)).rejects.toThrow(); expect(toCheckpoint(await loadCheckpoint(c))).toEqual(toCheckpoint(training));
    expect((await readdir(dir)).sort()).toEqual(['checkpoint.json', 'policy.json']);
  }));
  it('fallos de escribir/sincronizar/reemplazar conservan último válido y limpian temporal', async () => inDirectory(async dir => {
    const dest = join(dir, 'policy.json'); await savePolicy(dest, policy()); const before = await readFile(dest, 'utf8');
    for (const operation of ['write', 'sync', 'rename'] as const) {
      const { defaultFileOperations } = await import('../../src/learning/files');
      const ops: FileOperations = { ...defaultFileOperations };
      if (operation === 'rename') ops.rename = async () => { throw new Error('fallo de reemplazo'); };
      else {
        const original = ops.open;
        ops.open = async (...args) => {
          const handle = await original(...args);
          return { writeFile: operation === 'write' ? async () => { await handle.writeFile('parcial'); throw new Error('disco lleno'); } : handle.writeFile.bind(handle),
            sync: operation === 'sync' ? async () => { throw new Error('sin sincronización'); } : handle.sync.bind(handle), close: handle.close.bind(handle) };
        };
      }
      await expect(savePolicy(dest, policy(), ops)).rejects.toThrow(/guardar/);
      expect(await readFile(dest, 'utf8')).toBe(before); expect(await readdir(dir)).toEqual(['policy.json']);
    }
  }));
  it('errores de lectura y archivos incompatibles/corruptos nunca alteran destino', async () => inDirectory(async dir => {
    const path = join(dir, 'policy.json'); await writeFile(path, '{');
    await expect(loadPolicy(path)).rejects.toThrow(/JSON/); expect(await readFile(path, 'utf8')).toBe('{');
    await expect(loadPolicy(join(dir, 'ausente'))).rejects.toThrow(/leer/);
    const incompatible = policy(); incompatible.mapVersion = 'otro'; await writeFile(path, JSON.stringify(incompatible));
    await expect(loadPolicy(path)).rejects.toThrow(/incompatible/);
  }));
  it('rechaza tamaño Node antes de lectura/parseo (stat y comprobación posterior)', async () => {
    const { defaultFileOperations } = await import('../../src/learning/files');
    const read = vi.fn(); const spy = vi.spyOn(JSON, 'parse');
    const ops = { ...defaultFileOperations, stat: async () => ({ size: POLICY_MAX_BYTES + 1 }), readFile: read };
    await expect(loadPolicy('grande', ops)).rejects.toThrow(/2 MiB/); expect(read).not.toHaveBeenCalled();
    await expect(loadPolicy('creció', { ...ops, stat: async () => ({ size: 1 }), readFile: async () => Buffer.alloc(POLICY_MAX_BYTES + 1) })).rejects.toThrow(/2 MiB/);
    await expect(loadCheckpoint('grande', { ...ops, stat: async () => ({ size: CHECKPOINT_MAX_BYTES + 1 }) })).rejects.toThrow(/128 MiB/);
    expect(spy).not.toHaveBeenCalled(); spy.mockRestore();
  });
});
