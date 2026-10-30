import { cellSize, gridSize } from './board';
import { drawBoard } from './render';
import { createGame, pause, play, requestTurn, restart, step, type Direction } from './game';
import { advanceClock, freshClock } from './timing';
import { screenFor } from './view';
import { defaultSpeed, isSpeed, speeds, type Speed } from './settings';

function requiredElement<T extends Element>(selector: string, type: { new (...args: never[]): T }): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Required element missing: ${selector}`);
  return element;
}

const speedControls = requiredElement('#speed-controls', HTMLElement);
const speedDescription = requiredElement('#speed-description', HTMLElement);
const speedButtons = speedControls.querySelectorAll<HTMLButtonElement>('button[data-speed]');

const canvas = requiredElement('#board', HTMLCanvasElement);
const actionButton = requiredElement('#action', HTMLButtonElement);
const restartButton = requiredElement('#restart', HTMLButtonElement);
const scoreElement = requiredElement('#score', HTMLElement);
const statusElement = requiredElement('#status', HTMLElement);
const overlay = requiredElement('#overlay', HTMLElement);
const overlayTitle = requiredElement('#overlay-title', HTMLElement);
const overlayMessage = requiredElement('#overlay-message', HTMLElement);
const logicalSize = gridSize * cellSize;
// Keep the 400-unit game coordinates, but provide enough pixels for a 600px
// desktop board at the display's density. CSS shrinks it on smaller screens.
const renderScale = Math.max(1.5, window.devicePixelRatio * 1.5);
canvas.width = Math.round(logicalSize * renderScale);
canvas.height = canvas.width;
const drawingContext = canvas.getContext('2d');
if (!drawingContext) throw new Error('A 2D drawing context is unavailable.');
const context = drawingContext;
const pixelScale = canvas.width / logicalSize;
context.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);

// Preferences belong to the session, not the run: restarting preserves them.
let speed: Speed = defaultSpeed;
let game = createGame();
let clock = freshClock();

function render(): void {
  drawBoard(context, game.snake, game.food, game.direction);
  const screen = screenFor(game);
  // Hiding a focused element can synchronously move focus to the document body.
  const actionHadFocus = document.activeElement === actionButton;
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
  if (actionButton.hidden && actionHadFocus) restartButton.focus();
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

function renderSpeed(): void {
  speedButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.speed === speed));
  });
  speedDescription.textContent = `${speeds[speed].label}: one move every ${speeds[speed].interval} ms`;
}

speedButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const nextSpeed = button.dataset.speed;
    if (!isSpeed(nextSpeed) || nextSpeed === speed) return;
    speed = nextSpeed;
    // Trial behavior: reset progress without changing game phase or pending input.
    clock = freshClock(performance.now());
    renderSpeed();
  });
});

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
    const result = advanceClock(clock, now, speeds[speed].interval);
    clock = result.clock;
    if (result.shouldStep) {
      game = step(game);
      if (game.phase !== 'playing') clock = freshClock();
      render();
    }
  }
  requestAnimationFrame(frame);
}
renderSpeed();
render();
requestAnimationFrame(frame);
