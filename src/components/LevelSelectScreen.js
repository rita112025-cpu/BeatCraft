// Level grid with practice and speed options.
import { h } from "../../runtime.js";
import { SPEEDS } from "../constants.js";
import { IconMeter, ModeToggle } from "./common.js";

function RunOptions({ practice, onPracticeChange, speed, onSpeedChange }) {
  return h("div", {
    style: { background: "#EFF6FF", border: "2px solid #1C2A4A", borderRadius: 16, padding: 12, marginBottom: 16 },
    children: [
      h("label", {
        style: { display: "flex", gap: 8, alignItems: "center" },
        children: [
          h("input", { type: "checkbox", checked: practice, onChange: (event) => onPracticeChange(event.target.checked) }),
          "練習模式：無限生命、開放所有關卡",
        ],
      }),
      h("label", {
        style: { display: "flex", gap: 8, alignItems: "center", marginTop: 10 },
        children: [
          "節奏速度",
          h("select", {
            value: speed,
            onChange: (event) => onSpeedChange(Number(event.target.value)),
            style: { padding: 6, borderRadius: 8, border: "2px solid #1C2A4A" },
            children: SPEEDS.map((value) => h("option", { value, children: value + "×" }, value)),
          }),
        ],
      }),
      h("p", {
        style: { fontSize: 12, marginTop: 8 },
        children: "單人標準速度會儲存紀錄；每關獲得 1 星，即可解鎖下一關。練習、變速與雙人不影響進度。",
      }),
    ],
  });
}

function LevelCard({ level, practice, onSelect }) {
  const locked = level.locked && !practice;
  return h("button", {
    disabled: locked,
    onClick: onSelect,
    className: `text-left p-3 chunky-sm btn-press transition-all relative overflow-hidden ${level.locked ? "opacity-60 grayscale-[0.3]" : "hover:brightness-105"} ${level.isDemon ? "animate-[demonPulse_1.2s_infinite]" : ""}`,
    style: { background: level.locked ? "#E5E7EB" : level.color, borderColor: level.isDemon ? "#1C2A4A" : undefined },
    children: [
      h("div", {
        className: "flex justify-between items-start",
        children: [
          h("span", {
            className: `fredoka text-[13px] font-black px-2 py-0.5 rounded-full ${level.isDemon ? "bg-black text-white" : "bg-[#1C2A4A] text-white"}`,
            children: ["Lv", level.id, " ", level.icon || ""],
          }),
          h("span", { className: "text-[11px] font-black", children: [level.bpm, " BPM"] }),
        ],
      }),
      h("div", { className: "fredoka text-[15px] font-black mt-2 leading-[1.1]", children: level.name }),
      h("div", { className: "text-[11px] font-bold mt-1 opacity-80 leading-tight", children: level.desc }),
      h("div", {
        className: "mt-2 flex gap-0.5",
        children: h(IconMeter, { count: level.stars, icon: "★", className: "text-[14px]" }),
      }),
      level.best > 0 && h("div", { className: "mt-1 text-[10px] font-black", children: ["最高 ", level.best, " 分"] }),
      locked &&
        h("div", {
          className: "absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]",
          children: h("span", { className: "text-[22px]", children: "🔒" }),
        }),
      level.isDemon && h("div", { className: "absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF3B3B] animate-ping" }),
    ],
  });
}

export function LevelSelectScreen({ game }) {
  const totalStars = game.levels.reduce((sum, level) => sum + level.stars, 0);
  return h("div", {
    className: "py-1",
    children: [
      h(RunOptions, {
        practice: game.practice,
        onPracticeChange: game.setPractice,
        speed: game.speed,
        onSpeedChange: game.setSpeed,
      }),
      h("div", {
        className: "flex justify-between items-center mb-3 gap-2",
        children: [
          h("h3", { className: "fredoka text-[20px] font-black", children: "選擇關卡" }),
          h("div", {
            className: "flex items-center gap-2",
            children: [
              h("div", {
                className: "scale-[0.85] origin-right",
                children: h(ModeToggle, { mode: game.mode, onChange: game.setMode, compact: true }),
              }),
              h("button", {
                onClick: game.openMenu,
                className: "text-[12px] font-black px-3 py-1 rounded-full bg-white border-2 border-[#1C2A4A]",
                children: "← 返回",
              }),
            ],
          }),
        ],
      }),
      h("div", {
        className: "grid grid-cols-2 gap-3",
        children: game.levels.map((level, index) =>
          h(LevelCard, { level, practice: game.practice, onSelect: () => game.selectLevel(index) }, level.id),
        ),
      }),
      h("div", {
        className: "mt-4 p-3 rounded-xl bg-[#1C2A4A] text-white flex justify-between items-center",
        children: [
          h("span", { className: "text-[12px] font-bold", children: ["總星數 ", totalStars, " / ", game.levels.length * 3] }),
          h("span", {
            className: "text-[11px] opacity-70",
            children: game.mode === "2P" ? "雙人對戰中 · 藍 vs 粉" : "解鎖更多挑戰",
          }),
        ],
      }),
    ],
  });
}
