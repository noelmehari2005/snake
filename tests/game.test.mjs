import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, play, pause, requestTurn, step } from '../src/game.ts';
import { advanceClock, freshClock } from '../src/timing.ts';

test('start and paused states do not move', () => {
  const ready = createGame();
  assert.equal(step(ready), ready);
  const paused = pause(play(ready));
  assert.equal(step(paused), paused);
});
test('a tick advances the head, shifts the body, preserves length and prior state', () => {
  const game = play(createGame());
  const before = structuredClone(game);
  assert.deepEqual(step(game).snake, [{ x: 11, y: 10 }, { x: 10, y: 10 }, { x: 9, y: 10 }]);
  assert.deepEqual(game, before);
});
test('all four directions move by one cell', () => {
  for (const [direction, x, y] of [['up', 10, 9], ['down', 10, 11], ['left', 9, 10], ['right', 11, 10]]) {
    const game = { ...play(createGame()), direction };
    assert.deepEqual(step(game).snake[0], { x, y });
  }
});
test('reverse and same-direction input do not consume a valid turn', () => {
  let game = play(createGame());
  game = requestTurn(game, 'left');
  game = requestTurn(game, 'right');
  assert.equal(game.pendingDirection, null);
  game = requestTurn(game, 'up');
  assert.equal(game.direction, 'right');
  assert.deepEqual(step(game).snake[0], { x: 10, y: 9 });
});
test('first valid turn wins until the next tick', () => {
  let game = requestTurn(play(createGame()), 'up');
  game = requestTurn(game, 'left');
  game = step(game);
  assert.equal(game.direction, 'up');
  assert.equal(game.pendingDirection, null);
  assert.equal(requestTurn(game, 'left').pendingDirection, 'left');
});
test('pause clears queued input and ignores new turns', () => {
  const game = pause(requestTurn(play(createGame()), 'up'));
  assert.equal(game.pendingDirection, null);
  assert.equal(requestTurn(game, 'down'), game);
  assert.equal(play(game).direction, 'right');
});
test('temporary edge guard pauses without moving outside any edge', () => {
  for (const [direction, x, y] of [['up', 5, 0], ['down', 5, 19], ['left', 0, 5], ['right', 19, 5]]) {
    const game = { ...play(createGame()), direction, snake: [{ x, y }] };
    const next = step(game);
    assert.equal(next.phase, 'paused');
    assert.equal(next.atEdge, true);
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
