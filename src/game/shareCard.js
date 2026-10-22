// Share texts and the 1080x1920 story image drawn on a canvas.
import { starsFor } from "../../progress.js";
import { INK, LANE_COLORS } from "../constants.js";
import { topScore, winnerOf } from "./rules.js";

const WIDTH = 1080;
const HEIGHT = 1920;

const pageUrl = () => location.href.split("#")[0];

export function shareCaption(mode, level, { p1, p2 }) {
  if (mode === "1P") return `我在【${level.name}】拿到 ${p1.score}分！你行嗎？🔥`;
  return `藍隊 ${p1.score} vs 粉隊 ${p2.score}，${winnerOf({ p1, p2 })}獲勝！🔥`;
}

export function clipboardText(mode, level, players) {
  const { p1, p2 } = players;
  if (mode === "1P") return `我在 BeatCraft【${level.name}】拿到 ${p1.score}分！🔥 快來挑戰我！ ${pageUrl()}`;
  return `我在 BeatCraft 雙人對戰【${level.name}】藍隊 ${p1.score} vs 粉隊 ${p2.score}，${winnerOf(players)}獲勝！🔥 快來挑戰！ ${pageUrl()}`;
}

export const nativeShareText = (mode, level, players) =>
  `我在 BeatCraft ${level.name}拿到 ${topScore(mode, players)}分！🔥`;

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, width, height, radius);
  else ctx.rect(x, y, width, height);
}

function drawBackground(ctx) {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, INK);
  gradient.addColorStop(0.45, "#2A4A8A");
  gradient.addColorStop(1, "#7CC8FF");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 120; i++) {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc((i * 137) % WIDTH, (i * 233) % HEIGHT, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  const confetti = [...LANE_COLORS, "#FF3B3B"];
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * WIDTH;
    const y = Math.random() * HEIGHT * 0.9;
    const size = Math.random() * 12 + 4;
    ctx.fillStyle = confetti[i % confetti.length];
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    if (i % 3 === 0) {
      ctx.fillRect(x, y, size, size * 0.6);
    } else {
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function drawLogo(ctx) {
  const top = 110;
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 10;
  roundedRect(ctx, 80, top, WIDTH - 160, 110, 28);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.font = "700 62px Fredoka, Nunito, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("BEATCRAFT", WIDTH / 2, top + 72);

  ctx.fillStyle = "#FFE14A";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  roundedRect(ctx, WIDTH / 2 - 90, top + 105, 180, 48, 24);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.font = "900 28px Noto Sans TC, sans-serif";
  ctx.fillText("v3 節奏版", WIDTH / 2, top + 136);
}

function drawScore(ctx, mode, level, score) {
  ctx.fillStyle = "#fff";
  ctx.font = "800 42px Noto Sans TC, sans-serif";
  ctx.fillText(level.name, WIDTH / 2, 380);
  ctx.font = "700 26px Nunito, sans-serif";
  ctx.globalAlpha = 0.85;
  ctx.fillText(`${level.bpm} BPM • ${mode === "1P" ? "單人" : "雙人對戰"}`, WIDTH / 2, 425);
  ctx.globalAlpha = 1;

  const text = `${score}`;
  ctx.textAlign = "center";
  ctx.fillStyle = "#FFE14A";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 18;
  ctx.font = "900 220px Fredoka, sans-serif";
  ctx.strokeText(text, WIDTH / 2, 680);
  ctx.fillText(text, WIDTH / 2, 680);
  ctx.fillStyle = "#fff";
  ctx.font = "900 52px Noto Sans TC, sans-serif";
  ctx.fillText("分", WIDTH / 2 + ctx.measureText(text).width / 2 + 30, 680);

  const stars = starsFor(score);
  ctx.font = "80px sans-serif";
  ctx.fillText("⭐".repeat(stars) + "☆".repeat(3 - stars), WIDTH / 2, 780);
}

function drawStats(ctx, mode, players, isDemon) {
  const { p1, p2 } = players;
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 8;
  roundedRect(ctx, 80, 860, WIDTH - 160, 240, 28);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.textAlign = "left";
  ctx.font = "900 32px Noto Sans TC, sans-serif";
  if (mode === "1P") {
    ctx.fillText(`最高連擊：${p1.maxCombo}`, 130, 930);
    ctx.fillText(`完美：${p1.perfect}  不錯：${p1.good}`, 130, 985);
    ctx.fillStyle = "#FF3B3B";
    ctx.fillText(isDemon ? "🔥 魔王關存活！" : "✨ 節奏不間斷", 130, 1040);
  } else {
    ctx.fillText(`藍隊 ${p1.score}分  連擊${p1.maxCombo}`, 130, 930);
    ctx.fillText(`粉隊 ${p2.score}分  連擊${p2.maxCombo}`, 130, 985);
    ctx.fillStyle = p1.score > p2.score ? "#7CC8FF" : p2.score > p1.score ? "#FF7D9D" : INK;
    ctx.fillText(`${winnerOf(players)} 獲勝！👑`, 130, 1040);
  }
}

function drawFooter(ctx, mode, level, players, score) {
  const { p1, p2 } = players;
  const winner = winnerOf(players);
  const headline = mode === "1P" ? `我在【${level.name}】拿到 ${score}分！` : `${winner}在【${level.name}】拿下勝利！`;
  const tagline = mode === "1P" ? "你行嗎？🔥 快來挑戰我！" : `藍 ${p1.score} : ${p2.score} 粉，再戰一場！`;
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.font = "800 38px Noto Sans TC, sans-serif";
  ctx.fillText(headline, WIDTH / 2, 1240);
  ctx.font = "700 36px Noto Sans TC, sans-serif";
  ctx.fillText(tagline, WIDTH / 2, 1295);

  LANE_COLORS.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(360 + i * 110, 1400, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "700 24px Nunito, sans-serif";
  ctx.fillText("BEATCRAFT • 30秒一局 • 專注、快速、玩起來就是爽", WIDTH / 2, 1520);
  ctx.font = "600 22px Noto Sans TC, sans-serif";
  ctx.fillText("分享你的節奏 • BeatCraft", WIDTH / 2, 1560);
}

// Returns a PNG data URL, or null when the canvas cannot be drawn or exported.
export function drawShareCard(canvas, { mode, level, players, isDemon }) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const score = topScore(mode, players);
  drawBackground(ctx);
  drawLogo(ctx);
  drawScore(ctx, mode, level, score);
  drawStats(ctx, mode, players, isDemon);
  drawFooter(ctx, mode, level, players, score);
  try {
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}
