import { cellSize, gridSize, initialSnake } from './board';
import { drawBoard } from './render';

const canvas = document.querySelector('#board');

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('The board canvas is missing.');
}

canvas.width = gridSize * cellSize;
canvas.height = gridSize * cellSize;

const context = canvas.getContext('2d');
if (!context) {
  throw new Error('A 2D drawing context is unavailable.');
}

drawBoard(context, initialSnake);
