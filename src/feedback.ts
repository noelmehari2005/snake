import type { Game } from './game.ts';

export type FeedbackEvent = 'eat' | 'loss' | 'win';

// Derive feedback from transitions so renders, pauses, and repeated frames stay silent.
export function feedbackFor(before: Game, after: Game): FeedbackEvent | null {
  if (before.phase !== 'playing') return null;
  if (after.phase === 'gameOver' && before !== after) {
    return after.outcome === 'win' ? 'win' : 'loss';
  }
  return after.score > before.score ? 'eat' : null;
}
