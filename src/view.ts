import type { Game } from './game.ts';

// Keep screen wording and available actions consistent with the game state.
export function screenFor(game: Game) {
  const finished = game.phase === 'gameOver';
  const title = game.phase === 'start' ? 'Ready to play?' :
    game.phase === 'paused' ? 'Paused' : finished ?
      game.outcome === 'win' ? 'You win!' : 'Game over' : '';
  const message = game.phase === 'start' ? 'Eat orange food. Avoid walls and your body.' :
    game.phase === 'paused' ? 'Your board is saved. Resume when ready.' : finished ?
      `${game.outcome === 'win' ? 'You filled every cell.' :
        game.outcome === 'wall' ? 'You hit a wall.' : 'You hit your body.'} Final score: ${game.score}.` :
      'Playing';
  return {
    title,
    message,
    showOverlay: game.phase !== 'playing',
    showAction: !finished,
    actionLabel: game.phase === 'start' ? 'Start' : game.phase === 'paused' ? 'Resume' : 'Pause',
    showRestart: game.phase === 'paused' || finished,
  };
}
