import { describe, expect, it } from 'vitest';
import { advanceTraining, createTrainingState, parseCheckpoint, toCheckpoint } from '../../src/learning/checkpoint';

function fixture() {
  const state = createTrainingState(1);
  advanceTraining(state);
  return toCheckpoint(state);
}

describe('A-3: coherencia replay y esquema estricto del motor', () => {
  it.each([0, 1])('rechaza máscara [0,1,2,3] frente a legalidad [1,3], terminal=%s', terminal => {
    const c = fixture();
    c.replay.nextObservations.splice(22, 4, 0, 1, 0, 1);
    c.replay.terminals[0] = terminal;
    c.replay.nextLegalMasks[0] = 15;
    expect(() => parseCheckpoint(JSON.stringify(c))).toThrow();
  });
  it.each([0, 2, 8])('rechaza máscara incompleta o vacía %s con alternativas legales', mask => {
    const c = fixture();
    c.replay.nextObservations.splice(22, 4, 0, 1, 0, 1);
    c.replay.nextLegalMasks[0] = mask;
    expect(() => parseCheckpoint(JSON.stringify(c))).toThrow();
  });
  it.each([0, 1])('acepta máscara exacta incluso en terminal=%s y fallback solo sin legales', terminal => {
    const c = fixture();
    c.replay.terminals[0] = terminal;
    c.replay.nextObservations.splice(22, 4, 0, 1, 0, 1);
    c.replay.nextLegalMasks[0] = 10;
    expect(parseCheckpoint(JSON.stringify(c))).toEqual(c);
    c.replay.nextObservations.splice(22, 4, 0, 0, 0, 0);
    c.replay.nextLegalMasks[0] = 0;
    expect(parseCheckpoint(JSON.stringify(c))).toEqual(c);
  });
  it('rechaza acción actual ilegal cuando hay alternativas; conserva fallback sin legales', () => {
    const c = fixture();
    c.replay.observations.splice(22, 4, 0, 1, 0, 1);
    c.replay.actions[0] = 0;
    expect(() => parseCheckpoint(JSON.stringify(c))).toThrow();
    c.replay.observations.splice(22, 4, 0, 0, 0, 0);
    expect(parseCheckpoint(JSON.stringify(c))).toEqual(c);
  });
  const paths = ['game', 'game.player', 'game.player.position',
    ...[0, 1, 2, 3].flatMap(id => [`game.guardians.${id}`, `game.guardians.${id}.position`]),
    'game.pills.0', 'game.powers.0'];
  it.each(paths)('rechaza campos inesperados en %s', path => {
    const c = fixture();
    let node: any = c;
    for (const key of path.split('.')) node = node[key];
    node.unexpected = true;
    expect(() => parseCheckpoint(JSON.stringify(c))).toThrow();
  });
  it.each(paths)('rechaza campos ausentes en %s', path => {
    const c = fixture();
    let node: any = c;
    for (const key of path.split('.')) node = node[key];
    delete node[Object.keys(node)[0]];
    expect(() => parseCheckpoint(JSON.stringify(c))).toThrow();
  });
});
