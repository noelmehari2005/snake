import { cellSize, gridSize } from './board';
import { drawBoard } from './render';
import { createGame, pause, play, requestTurn, restart, step, type Direction } from './game';
import { advanceClock, freshClock } from './timing';
import { screenFor } from './view';

function requiredElement<T extends Element>(selector: string, type: { new (...args: never[]): T }): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Required element missing: ${selector}`);
  return element;
}

const canvas = requiredElement('#board', HTMLCanvasElement);
const actionButton = requiredElement('#action', HTMLButtonElement);
const restartButton = requiredElement('#restart', HTMLButtonElement);
const scoreElement = requiredElement('#score', HTMLElement);
const statusElement = requiredElement('#status', HTMLElement);
const overlay = requiredElement('#overlay', HTMLElement);
const overlayTitle = requiredElement('#overlay-title', HTMLElement);
const overlayMessage = requiredElement('#overlay-message', HTMLElement);
canvas.width = gridSize * cellSize;
canvas.height = gridSize * cellSize;
const drawingContext = canvas.getContext('2d');
if (!drawingContext) throw new Error('A 2D drawing context is unavailable.');
const context = drawingContext;

let game = createGame();
let clock = freshClock();

function render(): void {
  drawBoard(context, game.snake, game.food);
  const screen = screenFor(game);
  scoreElement.textContent = `Score: ${game.score}`;
  actionButton.textContent = screen.actionLabel;
  actionButton.hidden = !screen.showAction;
  restartButton.hidden = !screen.showRestart;
  overlay.hidden = !screen.showOverlay;
  overlayTitle.textContent = screen.title;
  overlayMessage.textContent = screen.message;
  const status = screen.title ? `${screen.title} ${screen.message}` : screen.message;
  // Avoid repeating live-region announcements after every movement tick.
  if (statusElement.textContent !== status) statusElement.textContent = status;
  // A focused Start/Resume button becomes Pause; Space therefore pauses via
  // native activation. At game over, move focus to the available Restart action.
  if (actionButton.hidden && document.activeElement === actionButton) restartButton.focus();
}

function togglePlay(): void {
  game = game.phase === 'playing' ? pause(game) : play(game);
  clock = freshClock();
  render();
}

function restartRun(): void {
  const next = restart(game);
  if (next === game) return;
  game = next;
  clock = freshClock();
  render();
  actionButton.focus();
}

actionButton.addEventListener('click', togglePlay);
restartButton.addEventListener('click', restartRun);
const keys: Record<string, Direction> = {
  ArrowUp: 'up', w: 'up', ArrowRight: 'right', d: 'right',
  ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left',
};
window.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  // Buttons retain native Enter/Space activation without a second global action.
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
