import { cellSize, gridSize, type Cell } from './board';
import type { Direction } from './game';

const angles: Record<Direction, number> = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
const ivory = '#eee9d9';
const center = (cell: Cell) => ({ x: (cell.x + 0.5) * cellSize, y: (cell.y + 0.5) * cellSize });

// Canvas styles persist between calls unless explicitly restored.
export function drawBoard(
  context: CanvasRenderingContext2D,
  snake: readonly Cell[],
  food: Cell | null = null,
  direction: Direction = 'right',
): void {
  context.save();
  try {
    paintBoard(context, snake, food, direction);
  } finally {
    context.restore();
  }
}

function paintBoard(
  context: CanvasRenderingContext2D,
  snake: readonly Cell[],
  food: Cell | null = null,
  direction: Direction = 'right',
): void {
  const boardSize = gridSize * cellSize;
  context.fillStyle = '#18171d';
  context.fillRect(0, 0, boardSize, boardSize);
  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      if ((x + y) % 2 === 0) {
        context.fillStyle = '#1e1c24';
        context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }
  context.strokeStyle = '#34303d';
  context.lineWidth = 0.5;
  context.beginPath();
  for (let cell = 1; cell < gridSize; cell += 1) {
    const pixel = cell * cellSize + 0.5;
    context.moveTo(pixel, 0);
    context.lineTo(pixel, boardSize);
    context.moveTo(0, pixel);
    context.lineTo(boardSize, pixel);
  }
  context.stroke();

  if (food) {
    const point = center(food);
    context.fillStyle = '#ffb45b';
    context.beginPath();
    context.arc(point.x, point.y + 1, 5.5, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#c4d690';
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(point.x, point.y - 4);
    context.quadraticCurveTo(point.x + 1, point.y - 8, point.x + 5, point.y - 7);
    context.stroke();
  }

  // Join only consecutive cells in the ordered body, never nearby parallel coils.
  context.strokeStyle = ivory;
  context.lineWidth = 12;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.beginPath();
  snake.forEach((cell, index) => {
    const point = center(cell);
    if (index === 0) context.moveTo(point.x, point.y);
    else {
      const previous = snake[index - 1];
      if (Math.abs(previous.x - cell.x) + Math.abs(previous.y - cell.y) === 1) {
        // Stop the final connection at the midpoint; a tapered tip finishes it.
        const last = index === snake.length - 1;
        const before = center(previous);
        context.lineTo(last ? (before.x + point.x) / 2 : point.x,
          last ? (before.y + point.y) / 2 : point.y);
      } else context.moveTo(point.x, point.y);
    }
  });
  context.stroke();

  // Small scale chevrons add detail while leaving most of the body uncluttered.
  context.strokeStyle = '#8b7c94';
  context.lineWidth = 1.1;
  snake.slice(1, -1).forEach((cell, index) => {
    const point = center(cell);
    const towardHead = center(snake[index]);
    context.save();
    context.translate(point.x, point.y);
    context.rotate(Math.atan2(towardHead.y - point.y, towardHead.x - point.x));
    for (const x of [-3, 2]) {
      context.beginPath();
      context.moveTo(x - 1, -3);
      context.lineTo(x + 1, 0);
      context.lineTo(x - 1, 3);
      context.stroke();
    }
    context.restore();
  });

  if (snake.length > 1) {
    const tail = center(snake[snake.length - 1]);
    const before = center(snake[snake.length - 2]);
    context.save();
    context.translate(tail.x, tail.y);
    context.rotate(Math.atan2(tail.y - before.y, tail.x - before.x));
    context.fillStyle = ivory;
    context.beginPath();
    context.moveTo(-10, -6);
    context.quadraticCurveTo(0, -5, 7, 0);
    context.quadraticCurveTo(0, 5, -10, 6);
    context.closePath();
    context.fill();
    context.restore();
  }

  if (snake.length === 0) return;
  const head = center(snake[0]);
  context.save();
  context.translate(head.x, head.y);
  context.rotate(angles[direction]);
  // A pale human-like face framed by dark hair, simplified for one grid cell.
  // Local +x is the face's forward direction; rotation follows movement.
  context.fillStyle = '#17131e';
  context.beginPath();
  const hair = [[-9,-8],[-5,-6],[-7,-9],[-1,-7],[2,-9],[5,-7],[1,-5],
    [5,-6],[4,6],[1,5],[4,9],[-2,7],[-6,9],[-5,6],[-9,8],[-7,1]];
  hair.forEach(([x,y], i) => i === 0 ? context.moveTo(x,y) : context.lineTo(x,y));
  context.closePath();
  context.fill();
  context.strokeStyle = '#b6a2c3';
  context.lineWidth = 0.5;
  context.stroke();
  context.fillStyle = '#e8dcc2';
  context.beginPath();
  context.moveTo(-3,-5.5);
  context.quadraticCurveTo(2,-6,7,-3);
  context.lineTo(9,0);
  context.lineTo(7,3);
  context.quadraticCurveTo(2,6,-3,5.5);
  context.closePath();
  context.fill();
  for (const side of [-1,1]) {
    context.strokeStyle = '#766080';
    context.lineWidth = 1.2;
    context.beginPath();
    context.moveTo(-1,side*2.8);
    context.lineTo(1,side*4.5);
    context.lineTo(4,side*3.8);
    context.stroke();
    context.fillStyle = '#d8b64e';
    context.beginPath();
    context.ellipse(0.5,side*2.6,1.9,1.1,side*0.3,0,Math.PI*2);
    context.fill();
    context.fillStyle = '#17131e';
    context.fillRect(0,side*2.6-0.8,0.6,1.6);
  }
  context.fillStyle = '#432634';
  context.beginPath();
  context.ellipse(5.3,0,2.8,2,0,0,Math.PI*2);
  context.fill();
  context.fillStyle = '#fff4dd';
  context.beginPath();
  context.moveTo(3,-1.5); context.lineTo(5,-0.3); context.lineTo(5,-1.8);
  context.moveTo(3,1.5); context.lineTo(5,0.3); context.lineTo(5,1.8);
  context.fill();
  context.fillStyle = '#bb7c91';
  context.beginPath();
  context.ellipse(6.5,0,0.9,0.8,0,0,Math.PI*2);
  context.fill();
  // Dark hair strands over the forehead strengthen the reference silhouette.
  context.strokeStyle = '#211a28';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(-4,-4); context.lineTo(0,-1);
  context.moveTo(-4,4); context.lineTo(0,1);
  context.stroke();
  context.restore();
}
