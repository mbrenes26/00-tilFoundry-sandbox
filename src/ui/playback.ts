import type { Action, GameState } from '../game/contracts';
import { createGame, legalActions, observe, step } from '../game/engine';
import { chooseAction, type PolicyV1 } from '../learning/policy';

/** Browser playback is inference only: no replay, optimizer, exploration or extra PRNG. */
export class Playback {
  state: GameState;
  paused = false;
  speed: 1 | 4 = 1;
  lastAction?: Action;
  constructor(readonly policy: PolicyV1, readonly seed: number) { this.state = createGame(seed); }
  advance(): boolean {
    if (this.paused || this.state.status !== 'running') return false;
    this.lastAction = chooseAction(this.policy, observe(this.state), legalActions(this.state));
    this.state = step(this.state, this.lastAction).state;
    return true;
  }
  restart(): void { this.state = createGame(this.seed); this.lastAction = undefined; }
}

export function validSeed(value: string): number | undefined {
  if (!/^\d+$/.test(value)) return undefined;
  const seed = Number(value);
  return Number.isSafeInteger(seed) && seed >= 0 && seed <= 0xffffffff ? seed : undefined;
}
