import { gridSize, initialSnake, type Cell } from './board.ts';

export type Direction = 'up' | 'right' | 'down' | 'left';
export type Phase = 'start' | 'playing' | 'paused';
export type Game = {
  snake: readonly Cell[];
  direction: Direction;
  pendingDirection: Direction | null;
  phase: Phase;
  atEdge: boolean;
};

const offsets: Record<Direction, Cell> = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

export function createGame(): Game {
  return {
    snake: initialSnake.map((cell) => ({ ...cell })),
    direction: 'right',
    pendingDirection: null,
    phase: 'start',
    atEdge: false,
  };
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
  return { ...game, phase: 'playing', pendingDirection: null, atEdge: false };
}

export function pause(game: Game): Game {
  if (game.phase !== 'playing') return game;
  return { ...game, phase: 'paused', pendingDirection: null };
}

export function step(game: Game): Game {
  if (game.phase !== 'playing') return game;
  const direction = game.pendingDirection ?? game.direction;
  const offset = offsets[direction];
  const head = game.snake[0];
  const nextHead = { x: head.x + offset.x, y: head.y + offset.y };

  // Temporary milestone-two guard; wall loss replaces this in milestone three.
  if (nextHead.x < 0 || nextHead.x >= gridSize ||
      nextHead.y < 0 || nextHead.y >= gridSize) {
    return { ...pause(game), atEdge: true };
  }

  return {
    ...game,
    direction,
    pendingDirection: null,
    snake: [nextHead, ...game.snake.slice(0, -1)],
    atEdge: false,
  };
}
