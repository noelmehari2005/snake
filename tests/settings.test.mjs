import test from 'node:test';
import assert from 'node:assert/strict';
import { speeds, defaultSpeed, isSpeed } from '../src/settings.ts';
import { advanceClock, freshClock } from '../src/timing.ts';

test('Normal is the default and only defined speed names are accepted', () => {
  assert.equal(defaultSpeed, 'normal');
  for (const name of Object.keys(speeds)) assert.equal(isSpeed(name), true);
  for (const name of ['turbo', 'constructor', '__proto__', undefined]) assert.equal(isSpeed(name), false);
});

for (const [speed, { interval }] of Object.entries(speeds)) {
  test(`${speed} waits its complete ${interval} ms interval`, () => {
    let result = advanceClock(freshClock(1000), 1000 + interval - 1, interval);
    assert.equal(result.shouldStep, false);
    result = advanceClock(result.clock, 1000 + interval, interval);
    assert.equal(result.shouldStep, true);
    assert.equal(result.clock.elapsed, 0);
  });
}

test('switching either faster or slower resets partial progress at the change time', () => {
  for (const [oldInterval, newInterval] of [[220, 100], [100, 220]]) {
    const old = advanceClock(freshClock(0), 90, oldInterval);
    assert.equal(old.shouldStep, false);
    const reset = freshClock(90);
    assert.equal(reset.elapsed, 0);
    assert.equal(advanceClock(reset, 90 + newInterval - 1, newInterval).shouldStep, false);
    assert.equal(advanceClock(reset, 90 + newInterval, newInterval).shouldStep, true);
  }
});

test('all speed settings discard backlog after a stall', () => {
  for (const { interval } of Object.values(speeds)) {
    const result = advanceClock(freshClock(0), 2000, interval);
    assert.equal(result.shouldStep, true);
    assert.ok(result.clock.elapsed < interval);
    assert.equal(advanceClock(result.clock, 2001, interval).shouldStep, false);
  }
});
