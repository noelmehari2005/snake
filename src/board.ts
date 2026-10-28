export type Cell = {
  x: number;
  y: number;
};

export const gridSize = 20;
export const cellSize = 20;

// Head first: the body trails to the left, so the snake faces right.
export const initialSnake: readonly Cell[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];
