// In-game screen: scoreboard, falling-note playfield, touch pad and pause overlay.
import { h } from "../../runtime.js";
import { HIT_LINE, LANE_COLORS, LANE_KEYS } from "../constants.js";
import { IconMeter } from "./common.js";

const FEEDBACK = {
  perfect: { label: "完美!", color: "#2ECC71" },
  good: { label: "不錯!", color: "#1C2A4A" },
  miss: { label: "失誤!", color: "#FF5A5F" },
  notYours: { label: "不是你的！", color: "#FF3B3B" },
  early: { label: "再靠近點!", color: "#1C2A4A" },
};

const teamLabel = (lane) => (lane < 2 ? "藍" : "粉");

function Overlay({ paused, countdown, onResume, onQuit }) {
  return h("div", {
    role: "dialog",
    "aria-label": paused ? "遊戲已暫停" : "準備開始",
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(28,42,74,.85)",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    children: h("div", {
      style: { background: "white", padding: 32, borderRadius: 24, textAlign: "center", maxWidth: 360, width: "100%" },
      children: paused
        ? [
            h("h2", { children: "遊戲已暫停" }, "title"),
            h("p", { children: "休息一下，回來繼續你的節奏。" }, "hint"),
            h(
              "button",
              {
                className: "chunky-sm",
                style: { padding: 12, marginTop: 20, background: "#FFE14A", width: "100%" },
                onClick: onResume,
                children: "繼續遊戲 ▶",
              },
              "resume",
            ),
            h("button", { style: { padding: 12, marginTop: 12 }, onClick: onQuit, children: "返回選關" }, "quit"),
          ]
        : [
            h("h2", { style: { fontSize: 64 }, children: countdown }, "count"),
            h("p", { children: "準備好 D F J K，跟上節拍！" }, "hint"),
          ],
    }),
  });
}

function StatLabel({ children }) {
  return h("div", { className: "text-[10px] font-black tracking-widest opacity-70", children });
}

function SoloScoreboard({ player, timeLeft, isDemon, reduceMotion }) {
  return h("div", {
    className: `chunky-sm p-2.5 sm:p-3 flex justify-between items-center gap-2 ${isDemon ? "bg-[#FF3B3B] text-white" : "bg-[#1C2A4A] text-white"}`,
    children: [
      h("div", {
        children: [
          h(StatLabel, { children: "SCORE" }),
          h("div", {
            className: "fredoka text-[22px] sm:text-[26px] leading-none font-black",
            children: [player.score, h("span", { className: "text-[14px] ml-1 opacity-80", children: "分" })],
          }),
        ],
      }),
      h("div", {
        className: "flex items-center gap-3",
        children: [
          h("div", {
            className: "text-center min-w-[52px]",
            children: [
              h(StatLabel, { children: "COMBO" }),
              h("div", {
                className: "fredoka text-[18px] leading-none font-black flex items-center justify-center gap-1",
                children: [
                  player.combo > 0 ? `${player.combo}` : "—",
                  player.combo > 5 &&
                    h("span", {
                      className: "text-[16px]",
                      style: { animation: reduceMotion ? "none" : "bounceY 0.5s infinite" },
                      children: "🔥",
                    }),
                ],
              }),
            ],
          }),
          h("div", { className: "w-px h-8 bg-white/20" }),
          h("div", {
            className: "text-center",
            children: [
              h(StatLabel, { children: "TIME" }),
              h("div", { className: "fredoka text-[18px] leading-none font-black tabular-nums", children: [timeLeft, "s"] }),
            ],
          }),
        ],
      }),
      h("div", {
        className: "text-right",
        children: [
          h(StatLabel, { children: "LIVES" }),
          h("div", {
            className: "flex gap-0.5 mt-0.5",
            children: h(IconMeter, { count: player.lives, icon: "❤️", className: "text-[16px] leading-none" }),
          }),
        ],
      }),
    ],
  });
}

function TeamCard({ title, player, background, heart }) {
  return h("div", {
    className: `chunky-sm ${background} p-2 flex flex-col items-center`,
    children: [
      h("div", { className: "text-[10px] font-black tracking-widest", children: title }),
      h("div", { className: "fredoka text-[20px] font-black leading-none", children: player.score }),
      h("div", { className: "text-[11px] font-black", children: ["x", player.combo, " ", player.combo > 5 ? "🔥" : ""] }),
      h("div", {
        className: "flex gap-0.5 mt-1",
        children: h(IconMeter, { count: player.lives, icon: heart, className: "text-[12px]" }),
      }),
    ],
  });
}

function VersusScoreboard({ players, timeLeft }) {
  return h("div", {
    className: "grid grid-cols-[1fr_auto_1fr] gap-2",
    children: [
      h(TeamCard, { title: "藍隊 P1", player: players.p1, background: "bg-[#7CC8FF]", heart: "💙" }),
      h("div", {
        className: "chunky-sm bg-[#1C2A4A] text-white p-2 flex flex-col items-center justify-center min-w-[54px]",
        children: [
          h("div", { className: "text-[9px] font-black opacity-70", children: "TIME" }),
          h("div", { className: "fredoka text-[18px] font-black", children: [timeLeft, "s"] }),
          h("div", { className: "text-[10px] font-black mt-1", children: "VS" }),
        ],
      }),
      h(TeamCard, { title: "粉隊 P2", player: players.p2, background: "bg-[#FF7D9D]", heart: "💖" }),
    ],
  });
}

function Lane({ lane, color, pressed, versus }) {
  const tint = versus ? (lane < 2 ? "rgba(124,200,255,0.25)" : "rgba(255,125,157,0.22)") : color + "55";
  return h("div", {
    className: "flex-1 relative border-r-[3px] border-[#1C2A4A]/15 last:border-r-0",
    style: { background: pressed ? "white" : tint, transition: "background 80ms" },
    children: [
      h("div", {
        className: "absolute inset-0 pointer-events-none",
        style: { background: pressed ? "white" : color + "55", opacity: versus ? 0.6 : 1 },
      }),
      versus &&
        h("div", {
          className: "absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#1C2A4A] text-white",
          children: teamLabel(lane),
        }),
      h("div", {
        className: "absolute bottom-2 left-1/2 -translate-x-1/2 w-[88%]",
        children: h("div", {
          className: "chunky-sm bg-white py-1.5 text-center fredoka text-[13px] font-black",
          style: { transform: pressed ? "scale(0.94)" : "scale(1)", background: "white" },
          children: [LANE_KEYS[lane], " ", versus ? `(${teamLabel(lane)})` : ""],
        }),
      }),
    ],
  });
}

function Note({ note, isDemon, sway }) {
  const center = 12.5 + note.lane * 25;
  return h("div", {
    className: "absolute w-[20%] sm:w-[22%] -ml-[10%] sm:-ml-[11%] h-[28px] chunky-sm flex items-center justify-center",
    style: {
      left: `calc(${center}% + ${sway}px)`,
      top: `${note.y}%`,
      background: LANE_COLORS[note.lane],
      transform: `translateY(-50%) ${note.y > 70 ? "scale(1.08)" : "scale(1)"}`,
      zIndex: 2,
      boxShadow: isDemon ? "0 0 0 2px #1C2A4A, 0 0 12px rgba(255,59,59,0.5)" : undefined,
    },
    children: [
      h("div", { className: "w-2 h-2 rounded-full bg-white border border-[#1C2A4A]" }),
      isDemon && h("div", { className: "absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FF3B3B] animate-ping" }),
    ],
  });
}

function Judgement({ feedback, reduceMotion }) {
  const { label, color } = FEEDBACK[feedback.quality ?? "early"];
  return h("div", {
    className: "absolute left-1/2 -translate-x-1/2 fredoka font-black text-[26px] pointer-events-none z-10",
    style: {
      top: "58%",
      animation: reduceMotion ? "none" : "pop 700ms forwards",
      color,
      WebkitTextStroke: "2px #1C2A4A",
      textShadow: "3px 3px 0 #1C2A4A",
    },
    children: label,
  });
}

function Playfield({ game, reduceMotion }) {
  const { mode, isDemon, notes, particles, feedback, pressedLane, players, level } = game;
  const versus = mode === "2P";
  const animated = !reduceMotion;
  const { p1, p2 } = players;
  return h("div", {
    className: "mt-3 relative chunky-sm overflow-hidden",
    style: {
      height: "440px",
      background: isDemon ? "#FFF0F0" : "#F8FAFF",
      animation: isDemon && animated ? "demonPulse 800ms infinite" : "none",
    },
    children: [
      h("div", {
        className: "absolute inset-0 flex",
        children: LANE_COLORS.map((color, lane) => h(Lane, { lane, color, pressed: pressedLane === lane, versus }, lane)),
      }),
      versus &&
        h("div", {
          className: "absolute top-0 bottom-0 left-1/2 w-0 border-l-[4px] border-dashed border-[#1C2A4A] opacity-30 z-[1]",
          style: { transform: "translateX(-2px)" },
        }),
      h("div", {
        className: "absolute left-2 right-2 h-[12px] bg-white border-[3px] border-[#1C2A4A] rounded-full z-[1]",
        style: { top: `${HIT_LINE}%`, boxShadow: "0 2px 0 #1C2A4A" },
        children: h("div", {
          className: "absolute inset-0 rounded-full opacity-40",
          style: { background: "repeating-linear-gradient(90deg, transparent 0 18px, #1C2A4A 18px 20px)" },
        }),
      }),
      // Keep dynamic lists nested so siblings keep stable positions between frames.
      notes.map((note) =>
        h(
          Note,
          { note, isDemon, sway: animated && isDemon ? Math.sin(game.frameTime / 300 + note.id * 0.85) * 40 : 0 },
          note.id,
        ),
      ),
      feedback && h(Judgement, { feedback, reduceMotion }, feedback.id),
      animated &&
        particles.map((p) =>
          h(
            "div",
            {
              className: "absolute w-2.5 h-2.5 rounded-full border border-[#1C2A4A] pointer-events-none",
              style: { left: `${p.x}%`, top: `${p.y}%`, background: p.color, zIndex: 3 },
            },
            p.id,
          ),
        ),
      (p1.combo >= 8 || p2.combo >= 8) &&
        animated &&
        h("div", {
          className:
            "absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#FFE14A] border-2 border-[#1C2A4A] fredoka text-[12px] font-black animate-pulse z-10",
          children: versus ? `藍 x${p1.combo} vs 粉 x${p2.combo} 超燃！` : `超級連擊 x${p1.combo}!`,
        }),
      isDemon &&
        animated &&
        h("div", {
          className: "absolute top-10 left-2 right-2 flex justify-between pointer-events-none",
          children: [
            h("span", {
              className: "text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FF3B3B] text-white border-2 border-[#1C2A4A]",
              children: "左右亂飄中",
            }),
            h("span", {
              className: "text-[10px] font-black px-2 py-0.5 rounded-full bg-black text-white border-2 border-[#1C2A4A]",
              children: `${level.bpm} BPM 極限`,
            }),
          ],
        }),
    ],
  });
}

function TouchPad({ mode, pressedLane, onHit }) {
  const versus = mode === "2P";
  return h("div", {
    className: "mt-3 grid grid-cols-4 gap-2",
    children: LANE_COLORS.map((color, lane) =>
      h(
        "button",
        {
          onPointerDown: (event) => {
            event.preventDefault();
            onHit(lane);
          },
          "aria-label": `打擊 ${LANE_KEYS[lane]}`,
          className: `chunky-sm py-3 sm:py-3.5 fredoka font-black text-[14px] btn-press relative overflow-hidden ${versus && lane < 2 ? "ring-2 ring-[#7CC8FF] ring-offset-1" : ""} ${versus && lane >= 2 ? "ring-2 ring-[#FF7D9D] ring-offset-1" : ""}`,
          style: { background: pressedLane === lane ? "white" : color, touchAction: "none" },
          children: [
            LANE_KEYS[lane],
            versus && h("span", { className: "absolute top-0.5 right-1 text-[8px]", children: teamLabel(lane) }),
          ],
        },
        lane,
      ),
    ),
  });
}

export function PlayScreen({ game, reduceMotion }) {
  const { mode, players, practice, speed } = game;
  const { p1, p2 } = players;
  return h("div", {
    className: "select-none",
    style: { animation: game.shaking ? "shakeX 200ms" : "none" },
    children: [
      (game.paused || game.countdown > 0) &&
        h(Overlay, { paused: game.paused, countdown: game.countdown, onResume: game.resume, onQuit: game.quit }),
      (practice || speed !== 1) &&
        h("p", {
          style: { textAlign: "center", padding: 8 },
          children: `${practice ? "練習模式 · 無限生命" : "變速挑戰"} · ${speed}× · 不記錄成績`,
        }),
      mode === "1P"
        ? h(SoloScoreboard, { player: p1, timeLeft: game.timeLeft, isDemon: game.isDemon, reduceMotion })
        : h(VersusScoreboard, { players, timeLeft: game.timeLeft }),
      h(Playfield, { game, reduceMotion }),
      h(TouchPad, { mode, pressedLane: game.pressedLane, onHit: game.hit }),
      h("div", {
        className: "mt-3 flex justify-between items-center",
        children: [
          h("button", {
            onClick: game.pause,
            className: "text-[12px] font-black px-3 py-1.5 rounded-full bg-white border-2 border-[#1C2A4A]",
            children: "⏸ 暫停 / 空白鍵",
          }),
          h("div", {
            className: "text-[11px] font-bold opacity-60",
            children:
              mode === "1P"
                ? `完美 ${p1.perfect} · 不錯 ${p1.good} · 失誤 ${p1.miss}`
                : `藍 ${p1.perfect}/${p1.good} 粉 ${p2.perfect}/${p2.good}`,
          }),
        ],
      }),
    ],
  });
}
