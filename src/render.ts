import { cellSize, gridSize, type Cell } from './board';

export function drawBoard(
  context: CanvasRenderingContext2D,
  snake: readonly Cell[],
): void {
  const boardSize = gridSize * cellSize;
  context.fillStyle = '#111827';
  context.fillRect(0, 0, boardSize, boardSize);

  context.strokeStyle = '#263244';
  context.lineWidth = 1;
  context.beginPath();
  // Outer edges are supplied by the Canvas border; draw internal lines only.
  for (let cell = 1; cell < gridSize; cell += 1) {
    const pixel = cell * cellSize + 0.5;
    context.moveTo(pixel, 0);
    context.lineTo(pixel, boardSize);
    context.moveTo(0, pixel);
    context.lineTo(boardSize, pixel);
  }
  context.stroke();

  snake.forEach((segment, index) => {
    context.fillStyle = index === 0 ? '#bbf7d0' : '#4ade80';
    // A small inset leaves each segment's cell boundary visible.
    context.fillRect(
      segment.x * cellSize + 2,
      segment.y * cellSize + 2,
      cellSize - 4,
      cellSize - 4,
    );
  });
}
