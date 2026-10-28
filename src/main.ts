import { cellSize, gridSize } from './board';
import { drawBoard } from './render';
import { createGame, pause, play, requestTurn, step, type Direction } from './game';
import { advanceClock, freshClock } from './timing';

const canvas = document.querySelector('#board');
const actionButton = document.querySelector<HTMLButtonElement>('#action');
const scoreElement = document.querySelector('#score');
const statusElement = document.querySelector('#status');
if (!(canvas instanceof HTMLCanvasElement) ||
    !(actionButton instanceof HTMLButtonElement) || !statusElement || !scoreElement) {
  throw new Error('Required game elements are missing.');
}
canvas.width = gridSize * cellSize;
canvas.height = gridSize * cellSize;
const context = canvas.getContext('2d');
if (!context) throw new Error('A 2D drawing context is unavailable.');

let game = createGame();
let clock = freshClock();

function render(): void {
  drawBoard(context!, game.snake, game.food);
  scoreElement!.textContent = `Score: ${game.score}`;
  actionButton!.textContent = game.phase === 'start' ? 'Start' :
    game.phase === 'playing' ? 'Pause' : game.phase === 'gameOver' ? 'Finished' : 'Resume';
  actionButton!.disabled = game.phase === 'gameOver';
  statusElement!.textContent = game.phase === 'gameOver'
    ? `${game.outcome === 'win' ? 'You filled the board — you win!' :
      game.outcome === 'wall' ? 'Game over: hit a wall.' : 'Game over: hit your body.'} Final score: ${game.score}. Reload to play again.`
    : game.phase === 'start' ? 'Ready. Select Start or press Enter.'
    : game.phase === 'playing' ? 'Playing' : 'Paused';
}

function togglePlay(): void {
  game = game.phase === 'playing' ? pause(game) : play(game);
  clock = freshClock();
  render();
}

actionButton.addEventListener('click', togglePlay);
const keys: Record<string, Direction> = {
  ArrowUp: 'up', w: 'up', ArrowRight: 'right', d: 'right',
  ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left',
};
window.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  // Keep native button keyboard activation; do not toggle twice.
  if (event.target instanceof HTMLButtonElement &&
      (event.key === ' ' || event.key === 'Enter')) {
    if (event.repeat) event.preventDefault();
    return;
  }
  const direction = keys[event.key.length === 1 ? event.key.toLowerCase() : event.key];
  if (direction && game.phase === 'playing') {
    event.preventDefault();
    if (!event.repeat) game = requestTurn(game, direction);
  } else if (event.key === ' ' && (game.phase === 'playing' || game.phase === 'paused')) {
    event.preventDefault();
    if (!event.repeat) togglePlay();
  } else if (event.key === 'Enter' && game.phase === 'start' && !event.repeat) {
    event.preventDefault();
    togglePlay();
  }
});

// A backgrounded page should never accumulate movement time.
function pauseForFocusLoss(): void {
  game = pause(game);
  clock = freshClock();
  render();
}
window.addEventListener('blur', pauseForFocusLoss);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseForFocusLoss();
});

function frame(now: number): void {
  if (game.phase === 'playing') {
    const result = advanceClock(clock, now);
    clock = result.clock;
    if (result.shouldStep) {
      game = step(game);
      if (game.phase !== 'playing') clock = freshClock();
      render();
    }
  }
  requestAnimationFrame(frame);
}
render();
requestAnimationFrame(frame);
