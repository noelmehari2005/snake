import { gridSize, initialSnake, type Cell } from './board.ts';

export type Direction = 'up' | 'right' | 'down' | 'left';
export type Phase = 'start' | 'playing' | 'paused' | 'gameOver';
export type Game = {
  snake: readonly Cell[];
  direction: Direction;
  pendingDirection: Direction | null;
  phase: Phase;
  food: Cell | null;
  score: number;
  outcome: 'wall' | 'self' | 'win' | null;
};

const offsets: Record<Direction, Cell> = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

// Enumerating empty cells avoids endless random retries on an almost-full board.
export function placeFood(snake: readonly Cell[], random: () => number = Math.random): Cell | null {
  const occupied = new Set(snake.map(({ x, y }) => y * gridSize + x));
  const empty: Cell[] = [];
  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      if (!occupied.has(y * gridSize + x)) empty.push({ x, y });
    }
  }
  if (empty.length === 0) return null;
  return empty[Math.floor(random() * empty.length)];
}

export function createGame(random: () => number = Math.random): Game {
  return {
    snake: initialSnake.map((cell) => ({ ...cell })),
    direction: 'right',
    pendingDirection: null,
    phase: 'start',
    food: placeFood(initialSnake, random),
    score: 0,
    outcome: null,
  };
}

export function restart(game: Game, random: () => number = Math.random): Game {
  if (game.phase !== 'paused' && game.phase !== 'gameOver') return game;
  return createGame(random);
}

export function requestTurn(game: Game, direction: Direction): Game {
  if (game.phase !== 'playing' || game.pendingDirection !== null) return game;
  const current = offsets[game.direction];
  const requested = offsets[direction];
  // Same-direction and reverse inputs do not consume the turn for this tick.
  if (direction === game.direction ||
      (current.x + requested.x === 0 && current.y + requested.y === 0)) return game;
  return { ...game, pendingDirection: direction };
}

export function play(game: Game): Game {
  if (game.phase === 'gameOver') return game;
  return { ...game, phase: 'playing', pendingDirection: null };
}

export function pause(game: Game): Game {
  if (game.phase !== 'playing') return game;
  return { ...game, phase: 'paused', pendingDirection: null };
}

export function step(game: Game, random: () => number = Math.random): Game {
  if (game.phase !== 'playing') return game;
  const direction = game.pendingDirection ?? game.direction;
  const offset = offsets[direction];
  const head = game.snake[0];
  const nextHead = { x: head.x + offset.x, y: head.y + offset.y };
  const eating = game.food !== null && nextHead.x === game.food.x && nextHead.y === game.food.y;
  const wall = nextHead.x < 0 || nextHead.x >= gridSize ||
    nextHead.y < 0 || nextHead.y >= gridSize;
  // The tail vacates its cell only on a non-growing move.
  const body = eating ? game.snake : game.snake.slice(0, -1);
  const self = body.some((cell) => cell.x === nextHead.x && cell.y === nextHead.y);
  if (wall || self) {
    return {
      ...game, phase: 'gameOver', outcome: wall ? 'wall' : 'self',
      pendingDirection: null,
    };
  }
  const snake = [nextHead, ...(eating ? game.snake : game.snake.slice(0, -1))];
  const food = eating ? placeFood(snake, random) : game.food;
  const won = eating && food === null;
  return {
    ...game, snake, food, direction, pendingDirection: null,
    score: game.score + (eating ? 1 : 0),
    phase: won ? 'gameOver' : 'playing',
    outcome: won ? 'win' : null,
  };
}
