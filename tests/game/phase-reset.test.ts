import { describe, expect, it } from 'vitest';
import { createGame, step } from '../../src/game/engine';
import type { GameState } from '../../src/game/contracts';

function fixture(): GameState {
  const s = createGame(42);
  s.pills = [{ x: 17, y: 13 }]; s.powers = [];
  s.guardians.forEach(g => { g.active = false; g.respawnRemaining = 1000; });
  return s;
}

describe('M-3: inversión solo por transición real, no por reinicio de vida', () => {
  it('inicializa sin transición pendiente', () => {
    expect(createGame(42)).toMatchObject({ phaseChangePending: false });
  });

  it.each([
    ['scatter', 70, 'chase', 200, 1, 3],
    ['chase', 200, 'scatter', 70, 3, 1],
  ] as const)('frontera %s/%i: marca cambio a %s/%i y consume inversión una vez', (phase, duration, nextPhase, nextDuration, direction, reversed) => {
    let s = fixture(); s.phase = phase; s.phaseRemaining = duration;
    for (let i = 1; i < duration; i++) {
      s = step(s, 0).state;
      expect(s).toMatchObject({ phase, phaseRemaining: duration - i, phaseChangePending: false });
    }
    s = step(s, 0).state;
    expect(s).toMatchObject({ phase: nextPhase, phaseRemaining: nextDuration, phaseChangePending: true });
    // Corredor horizontal: el nuevo objetivo queda detrás del guardián 1.
    s.player.position = { x: 1, y: 1 };
    Object.assign(s.guardians[0], { position: { x: 9, y: 7 }, direction, active: true, respawnRemaining: 0 });
    const restored = JSON.parse(JSON.stringify(s)) as GameState;
    const r = step(s, 0);
    expect(r).toEqual(step(restored, 0));
    expect(r.state.guardians[0].direction).toBe(reversed);
    expect(r.state).toMatchObject({ phaseChangePending: false, phaseRemaining: nextDuration - 1 });
    // Aunque el objetivo pase al otro lado, ya no hay autorización para invertir.
    if (nextPhase === 'chase') r.state.player.position = { x: 17, y: 1 };
    expect(step(r.state, 0).state.guardians[0].direction).toBe(reversed);
  });

  it('muerte elimina la transición pendiente y 70 pasos completos no habilitan inversión', () => {
    let s = fixture(); s.tick = 200; s.phase = 'chase'; s.phaseRemaining = 200;
    Object.assign(s, { phaseChangePending: true });
    s.player.position = { x: 4, y: 1 };
    Object.assign(s.guardians[0], { position: { x: 6, y: 1 }, direction: 3, active: true, respawnRemaining: 0 });
    const death = step(s, 1);
    expect(death.events).toContainEqual({ type: 'death', lives: 2 });
    s = death.state;
    expect(s).toMatchObject({ phase: 'scatter', phaseRemaining: 70, phaseChangePending: false });
    // Aísla la decisión del id 4: su esquina está a la izquierda, pero no puede invertir.
    s.guardians.forEach(g => { g.active = false; g.respawnRemaining = 1000; });
    Object.assign(s.guardians[3], { position: { x: 9, y: 7 }, direction: 1, active: true, respawnRemaining: 0 });
    expect(step(s, 0).state.guardians[3].direction).toBe(1);
  });

  it.each(['lost', 'won', 'timeout'] as const)('terminal %s conserva el indicador sin consumirlo', status => {
    const s = fixture(); s.status = status;
    Object.assign(s, { phaseChangePending: true });
    const before = JSON.stringify(s);
    expect(step(s, 0)).toEqual({ state: s, events: [] });
    expect(JSON.stringify(s)).toBe(before);
  });
});
