import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, play, pause, requestTurn, step, placeFood } from '../src/game.ts';
import { advanceClock, freshClock } from '../src/timing.ts';

test('start and paused states do not move', () => {
  const ready = createGame(() => 0);
  assert.equal(step(ready), ready);
  const paused = pause(play(ready));
  assert.equal(step(paused), paused);
});
test('a tick advances the head, shifts the body, preserves length and prior state', () => {
  const game = play(createGame(() => 0));
  const before = structuredClone(game);
  assert.deepEqual(step(game).snake, [{ x: 11, y: 10 }, { x: 10, y: 10 }, { x: 9, y: 10 }]);
  assert.deepEqual(game, before);
});
test('all four directions move by one cell', () => {
  for (const [direction, x, y] of [['up', 10, 9], ['down', 10, 11], ['left', 9, 10], ['right', 11, 10]]) {
    const game = { ...play(createGame(() => 0)), direction, snake: [{ x: 10, y: 10 }] };
    assert.deepEqual(step(game).snake[0], { x, y });
  }
});
test('reverse and same-direction input do not consume a valid turn', () => {
  let game = play(createGame(() => 0));
  game = requestTurn(game, 'left');
  game = requestTurn(game, 'right');
  assert.equal(game.pendingDirection, null);
  game = requestTurn(game, 'up');
  assert.equal(game.direction, 'right');
  assert.deepEqual(step(game).snake[0], { x: 10, y: 9 });
});
test('first valid turn wins until the next tick', () => {
  let game = requestTurn(play(createGame(() => 0)), 'up');
  game = requestTurn(game, 'left');
  game = step(game);
  assert.equal(game.direction, 'up');
  assert.equal(game.pendingDirection, null);
  assert.equal(requestTurn(game, 'left').pendingDirection, 'left');
});
test('pause clears queued input and ignores new turns', () => {
  const game = pause(requestTurn(play(createGame(() => 0)), 'up'));
  assert.equal(game.pendingDirection, null);
  assert.equal(requestTurn(game, 'down'), game);
  assert.equal(play(game).direction, 'right');
});
test('crossing any edge ends the run without moving outside the board', () => {
  for (const [direction, x, y] of [['up', 5, 0], ['down', 5, 19], ['left', 0, 5], ['right', 19, 5]]) {
    const game = { ...play(createGame(() => 0)), direction, snake: [{ x, y }] };
    const next = step(game);
    assert.equal(next.phase, 'gameOver');
    assert.equal(next.outcome, 'wall');
    assert.deepEqual(next.snake, game.snake);
  }
});
test('fresh clock waits a full interval, including after resume', () => {
  let result = advanceClock(freshClock(), 1000);
  assert.equal(result.shouldStep, false);
  result = advanceClock(result.clock, 1149);
  assert.equal(result.shouldStep, false);
  assert.equal(advanceClock(result.clock, 1150).shouldStep, true);
  assert.equal(advanceClock(freshClock(), 5000).shouldStep, false);
});
test('clock retains normal fractional time but discards stall backlog', () => {
  let result = advanceClock(freshClock(), 0);
  result = advanceClock(result.clock, 160);
  assert.equal(result.shouldStep, true);
  assert.equal(result.clock.elapsed, 10);
  result = advanceClock(result.clock, 2000);
  assert.equal(result.shouldStep, true);
  assert.ok(result.clock.elapsed < 150);
  assert.equal(advanceClock(result.clock, 2001).shouldStep, false);
});

test('eating grows by exactly one, increments score, and replaces food on an empty cell', () => {
  const game = { ...play(createGame(() => 0)), food: { x: 11, y: 10 } };
  const next = step(game, () => 0);
  assert.equal(next.snake.length, 4);
  assert.equal(next.score, 1);
  assert.deepEqual(next.snake.slice(1), game.snake);
  assert.ok(!next.snake.some((cell) => cell.x === next.food.x && cell.y === next.food.y));
  assert.equal(game.score, 0);
});
test('non-eating movement preserves score and food without sampling randomness', () => {
  const game = play(createGame(() => 0));
  const next = step(game, () => { throw new Error('Unexpected random call'); });
  assert.equal(next.score, game.score);
  assert.deepEqual(next.food, game.food);
});
test('entering occupied body ends the run, preserving board and score', () => {
  const game = { ...play(createGame(() => 0)), direction: 'down', snake: [
    { x: 2, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 },
  ] };
  const next = step(game);
  assert.equal(next.outcome, 'self');
  assert.equal(next.phase, 'gameOver');
  assert.deepEqual(next.snake, game.snake);
  assert.equal(next.score, game.score);
});
test('moving into departing tail is allowed', () => {
  const game = { ...play(createGame(() => 0)), direction: 'down', snake: [
    { x: 2, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 2, y: 3 },
  ] };
  const next = step(game);
  assert.equal(next.phase, 'playing');
  assert.deepEqual(next.snake[0], { x: 2, y: 3 });
  assert.equal(next.snake.length, 4);
});
test('food selection covers empty cells at both random extremes', () => {
  const snake = createGame(() => 0).snake;
  for (const random of [() => 0, () => 0.5, () => 0.999999]) {
    const food = placeFood(snake, random);
    assert.ok(food.x >= 0 && food.x < 20 && food.y >= 0 && food.y < 20);
    assert.ok(!snake.some((cell) => cell.x === food.x && cell.y === food.y));
  }
});
test('one remaining cell is selected; a full board requires no randomness', () => {
  const cells = Array.from({ length: 400 }, (_, i) => ({ x: i % 20, y: Math.floor(i / 20) }));
  assert.deepEqual(placeFood(cells.slice(1), () => 0.9), { x: 0, y: 0 });
  assert.equal(placeFood(cells, () => { throw new Error('Unexpected random call'); }), null);
});
test('eating the last empty cell wins without attempting further randomness', () => {
  // A continuous serpentine body whose head is adjacent to the last empty cell.
  const path = [];
  for (let y = 0; y < 20; y++) {
    for (let i = 0; i < 20; i++) path.push({ x: y % 2 === 0 ? i : 19 - i, y });
  }
  const game = { ...play(createGame(() => 0)), snake: path.slice(1), direction: 'left',
    food: path[0], score: 396 };
  const next = step(game, () => { throw new Error('Unexpected random call'); });
  assert.equal(next.snake.length, 400);
  assert.equal(next.score, 397);
  assert.equal(next.food, null);
  assert.equal(next.phase, 'gameOver');
  assert.equal(next.outcome, 'win');
});
test('finished runs cannot move, turn, pause, or resume', () => {
  const game = { ...play(createGame(() => 0)), phase: 'gameOver', outcome: 'wall' };
  assert.equal(step(game), game);
  assert.equal(requestTurn(game, 'up'), game);
  assert.equal(pause(game), game);
  assert.equal(play(game), game);
});

test('restart restores all run data after pause, loss, or win and stays at start', async () => {
  const { restart } = await import('../src/game.ts');
  for (const [phase, outcome] of [['paused', null], ['gameOver', 'wall'], ['gameOver', 'self'], ['gameOver', 'win']]) {
    const prior = { ...createGame(() => 0), phase, outcome, score: 12,
      direction: 'down', pendingDirection: 'left', snake: [{ x: 5, y: 7 }], food: null };
    const next = restart(prior, () => 0);
    assert.deepEqual(next, createGame(() => 0));
    assert.equal(next.phase, 'start');
    assert.notEqual(next.snake, prior.snake);
    assert.equal(step(next), next);
  }
});
test('restart cannot discard a playing run or reroll the start board', async () => {
  const { restart } = await import('../src/game.ts');
  for (const game of [createGame(() => 0), play(createGame(() => 0))]) {
    assert.equal(restart(game, () => { throw new Error('Unexpected restart'); }), game);
  }
});
test('screen actions and messages match start, play, pause, loss, and win', async () => {
  const { screenFor } = await import('../src/view.ts');
  const ready = createGame(() => 0);
  assert.equal(screenFor(ready).actionLabel, 'Start');
  assert.equal(screenFor(ready).showRestart, false);
  const active = screenFor(play(ready));
  assert.equal(active.showOverlay, false);
  assert.equal(active.showRestart, false);
  assert.equal(active.actionLabel, 'Pause');
  const paused = screenFor(pause(play(ready)));
  assert.equal(paused.actionLabel, 'Resume');
  assert.equal(paused.showRestart, true);
  assert.equal(paused.showOverlay, true);
  for (const outcome of ['wall', 'self', 'win']) {
    const screen = screenFor({ ...ready, phase: 'gameOver', score: 8, outcome });
    assert.equal(screen.showAction, false);
    assert.equal(screen.showRestart, true);
    assert.equal(screen.showOverlay, true);
    assert.match(screen.message, /Final score: 8/);
    assert.equal(screen.title, outcome === 'win' ? 'You win!' : 'Game over');
  }
});
