import test from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';
import { levels } from '../progress.js';
import { DEFAULT_SETTINGS } from '../src/constants.js';
import { applyHit, applyMiss, newPlayer } from '../src/game/rules.js';
register('./support/react-loader.js', import.meta.url);
const react = await import('./support/react-mock.js');
const { useGame } = await import('../src/hooks/useGame.js');

function session(t) {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  react.reset();
  const frames = new Map();
  let nextId = 0;
  let game;
  let settings = { ...DEFAULT_SETTINGS };
  let progress = levels.map(level => ({ ...level }));
  globalThis.requestAnimationFrame = callback => { frames.set(++nextId, callback); return nextId; };
  globalThis.cancelAnimationFrame = id => frames.delete(id);
  globalThis.window = { addEventListener() {}, removeEventListener() {} };
  globalThis.document = { addEventListener() {}, removeEventListener() {} };
  const sfx = { unlock() {}, beat() {}, judgement() {} };
  function render() {
    react.render(() => {
      game = useGame({ progress, setProgress: update => { progress = update(progress); }, settings, sfx });
      return null;
    });
    return game;
  }
  function countdown() { for (let i = 0; i < 3; i++) { t.mock.timers.tick(1000); render(); } }
  function frame(now) {
    const callbacks = [...frames.values()]; frames.clear();
    callbacks.forEach(callback => callback(now)); render();
  }
  render();
  return { get game() { return game; }, render, countdown, frame, toggleMusic() { settings = { ...settings, music: !settings.music }; render(); } };
}

test('active milliseconds survive pause and resume instead of restarting each second', t => {
  const s = session(t);
  s.game.selectLevel(0);s.render();s.countdown();
  s.frame(100);t.mock.timers.tick(900);s.frame(1000);
  assert.equal(s.game.timeLeft, 30);
  s.game.pause();s.render();t.mock.timers.tick(5000);s.render();
  assert.equal(s.game.timeLeft, 30);
  s.game.resume();s.render();s.countdown();
  s.frame(10000);t.mock.timers.tick(200);s.frame(10200);
  assert.equal(s.game.timeLeft, 29);
});

test('toggling music does not grant extra game time', t => {
  const s = session(t);
  s.game.selectLevel(0);s.render();s.countdown();
  s.frame(100);t.mock.timers.tick(900);s.frame(1000);
  s.toggleMusic();
  t.mock.timers.tick(200);s.frame(1200);
  assert.equal(s.game.timeLeft, 29);
});

test('a player with zero lives cannot earn more points', () => {
  const eliminated = { ...newPlayer(), lives: 0, score: 700, maxCombo: 7 };
  assert.deepEqual(applyHit(eliminated, 'perfect'), eliminated);
});

test('an eliminated player does not accumulate extra misses', () => {
  const eliminated = { ...newPlayer(), lives: 0, miss: 3 };
  assert.deepEqual(applyMiss(eliminated, false), eliminated);
});

test('a practice run ends after thirty active seconds', t => {
  const s = session(t);
  s.game.setPractice(true);s.render();
  s.game.selectLevel(0);s.render();s.countdown();
  s.frame(100);s.frame(30100);s.render();
  assert.equal(s.game.timeLeft, 0);
  assert.equal(s.game.screen, 'result');
});
