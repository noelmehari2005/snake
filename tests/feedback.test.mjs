import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, play, pause, step } from '../src/game.ts';
import { feedbackFor } from '../src/feedback.ts';
import { GameAudio } from '../src/audio.ts';

test('only game transitions trigger feedback, with win taking precedence over eating', () => {
  const ready = createGame(() => 0);
  const active = play(ready);
  assert.equal(feedbackFor(ready, active), null);
  assert.equal(feedbackFor(active, step(active)), null);
  assert.equal(feedbackFor(active, pause(active)), null);
  assert.equal(feedbackFor(active, { ...active, score: 1 }), 'eat');
  assert.equal(feedbackFor(active, { ...active, phase: 'gameOver', outcome: 'wall' }), 'loss');
  assert.equal(feedbackFor(active, { ...active, phase: 'gameOver', outcome: 'self' }), 'loss');
  const won = { ...active, phase: 'gameOver', outcome: 'win', score: 397 };
  assert.equal(feedbackFor(active, won), 'win');
  assert.equal(feedbackFor(won, won), null);
});

function fakeAudio() {
  const voices = [];
  const param = { setValueAtTime() {}, linearRampToValueAtTime() {} };
  const context = {
    state: 'running', currentTime: 0, destination: {},
    async resume() {},
    createGain: () => ({ gain: param, connect() {}, disconnect() {} }),
    createOscillator() {
      const voice = { frequency: param, connect() {}, disconnect() {}, startCount: 0, stopCount: 0,
        start() { this.startCount++; }, stop() { this.stopCount++; } };
      voices.push(voice);
      return voice;
    },
  };
  return { voices, context };
}

test('audio defaults off, creates context on opt-in, schedules cues, and stops on mute', async () => {
  const fake = fakeAudio();
  let created = 0;
  const audio = new GameAudio(() => { created++; return fake.context; });
  audio.play('eat');
  assert.equal(created, 0);
  assert.equal(await audio.setEnabled(true), true);
  audio.play('eat');
  assert.equal(fake.voices.length, 2);
  assert.ok(fake.voices.every((v) => v.startCount === 1));
  audio.stop();
  assert.ok(fake.voices.every((v) => v.stopCount === 2));
  audio.play('win');
  assert.equal(fake.voices.length, 5);
  await audio.setEnabled(false);
  const count = fake.voices.length;
  audio.play('loss');
  assert.equal(fake.voices.length, count);
  assert.equal(audio.enabled, false);
});

test('unavailable or blocked audio fails gracefully', async () => {
  const unsupported = new GameAudio(() => { throw new Error('No audio'); });
  assert.equal(await unsupported.setEnabled(true), false);
  assert.doesNotThrow(() => unsupported.play('eat'));
  const fake = fakeAudio();
  fake.context.resume = async () => { throw new Error('Blocked'); };
  const blocked = new GameAudio(() => fake.context);
  assert.equal(await blocked.setEnabled(true), false);
  assert.doesNotThrow(() => blocked.stop());
});
