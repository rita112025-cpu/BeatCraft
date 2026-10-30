// Pure scoring and note rules, kept free of React so they are easy to test.
import { HIT_LINE, LANE_COLORS, MAX_LIVES, MISS_Y, SPAWN_Y } from "../constants.js";

const PERFECT_WINDOW = 5.5;
const GOOD_WINDOW = 11;
const POINTS = { perfect: 100, good: 50 };
const BURST_SIZE = 14;

export const newPlayer = () => ({ score: 0, combo: 0, maxCombo: 0, lives: MAX_LIVES, perfect: 0, good: 0, miss: 0 });
export const newPlayers = () => ({ p1: newPlayer(), p2: newPlayer() });

// In 1P every lane belongs to p1; in 2P lanes 0-1 are blue (p1) and 2-3 are pink (p2).
export const teamOfLane = (lane, mode) => (mode === "1P" || lane < 2 ? "p1" : "p2");

export function judge(distance) {
  if (distance < PERFECT_WINDOW) return "perfect";
  if (distance < GOOD_WINDOW) return "good";
  return "miss";
}

export function applyHit(player, quality) {
  if (player.lives <= 0) return player;
  const combo = player.combo + 1;
  const comboBonus = Math.floor(player.combo / 5) * 10;
  return {
    ...player,
    score: player.score + POINTS[quality] + comboBonus,
    combo,
    maxCombo: Math.max(player.maxCombo, combo),
    [quality]: player[quality] + 1,
  };
}

export function applyMiss(player, practice) {
  if (player.lives <= 0) return player;
  return {
    ...player,
    lives: practice ? player.lives : Math.max(0, player.lives - 1),
    combo: 0,
    miss: player.miss + 1,
  };
}

export function isGameOver(mode, { p1, p2 }) {
  return mode === "1P" ? p1.lives <= 0 : p1.lives <= 0 && p2.lives <= 0;
}

export const topScore = (mode, { p1, p2 }) => (mode === "1P" ? p1.score : Math.max(p1.score, p2.score));

export function winnerOf({ p1, p2 }) {
  if (p1.score === p2.score) return "平手";
  return p1.score > p2.score ? "藍隊" : "粉隊";
}

export function resultTitle(mode, players) {
  if (mode === "2P") return players.p1.score === players.p2.score ? "平手！再來一場！" : `${winnerOf(players)} 獲勝！`;
  const { score } = players.p1;
  if (score >= 2000) return "節奏大師！";
  if (score >= 1000) return "還不錯喔！";
  if (score >= 400) return "繼續加油！";
  return "再試一次！";
}

export function hitRate({ p1, p2 }) {
  const hits = p1.perfect + p1.good + p2.perfect + p2.good;
  return Math.round((hits / Math.max(1, hits + p1.miss + p2.miss)) * 100);
}

// Milliseconds a note takes to fall the full playfield height at 1x speed.
const fallTime = (level) => (level.isDemon ? 1300 : Math.max(900, 1900 - level.bpm * 5));
export const fallVelocity = (level, speed) => (speed * 100) / fallTime(level);
export const beatInterval = (level, speed) => 60000 / (level.bpm * speed);

export const spawnNotes = (lanes, beatIndex) =>
  lanes.map((lane) => ({ id: beatIndex * 4 + lane, lane, y: SPAWN_Y, hit: false }));

// Moves notes down, drops notes that were hit and separates the ones that fell past the line.
export function advanceNotes(notes, distance) {
  const moved = notes.map((note) => ({ ...note, y: note.y + distance })).filter((note) => !note.hit);
  return {
    active: moved.filter((note) => note.y <= MISS_Y),
    missed: moved.filter((note) => note.y > MISS_Y),
  };
}

export const closestNote = (notes) =>
  [...notes].sort((a, b) => Math.abs(a.y - HIT_LINE) - Math.abs(b.y - HIT_LINE))[0];

export function createBurst(lane, firstId) {
  return Array.from({ length: BURST_SIZE }, (_, i) => ({
    id: firstId + i,
    x: 12 + lane * 25 + 12.5 + (Math.random() - 0.5) * 10,
    y: HIT_LINE,
    color: LANE_COLORS[lane],
    vx: (Math.random() - 0.5) * 5,
    vy: -Math.random() * 6 - 2,
  }));
}

export const stepParticles = (particles) =>
  particles
    .map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.25 }))
    .filter((p) => p.y < 120);
