const canvas = document.querySelector('#board');
const statusElement = document.querySelector('#status');

// Narrow the DOM type before using Canvas-specific methods.
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('The board canvas is missing.');
}

const context = canvas.getContext('2d');
if (!context) {
  throw new Error('A 2D drawing context is unavailable.');
}

context.fillStyle = '#111827';
context.fillRect(0, 0, canvas.width, canvas.height);

// Grid cell (3, 5) becomes pixel position (60, 100).
const cellSize = 20;
context.fillStyle = '#4ade80';
context.fillRect(3 * cellSize, 5 * cellSize, cellSize, cellSize);

if (statusElement) {
  statusElement.textContent = 'TypeScript is running: one square drawn at grid cell (3, 5).';
}
