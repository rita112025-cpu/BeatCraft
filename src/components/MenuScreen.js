// Title screen: mode choice, how to play and the start button.
import { h } from "../../runtime.js";
import { LANE_COLORS, LANE_KEYS } from "../constants.js";
import { ModeToggle } from "./common.js";

const FEATURES = [
  ["bg-[#FF3B3B]/20", "🔥 魔王 160BPM"],
  ["bg-[#7CC8FF]/30", "👥 雙人對戰"],
  ["bg-[#FFE14A]/40", "📸 限動分享"],
];

function KeyLegend({ mode }) {
  return h("div", {
    className: "mt-3 flex gap-2 flex-wrap",
    children: LANE_KEYS.map((key, lane) =>
      h(
        "div",
        {
          className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border-2 border-[#1C2A4A] text-[12px] font-black",
          children: [
            h("span", {
              className: "w-5 h-5 rounded-full border-2 border-[#1C2A4A] flex items-center justify-center text-[10px]",
              style: { background: LANE_COLORS[lane] },
              children: key,
            }),
            key,
            " ",
            mode === "2P" ? `· ${lane < 2 ? "藍" : "粉"}隊` : "",
          ],
        },
        key,
      ),
    ),
  });
}

export function MenuScreen({ mode, onModeChange, onStart }) {
  return h("div", {
    className: "text-center py-2 sm:py-4",
    children: [
      h("div", {
        className: "relative inline-block",
        children: [
          h("h2", {
            className: "fredoka text-[46px] sm:text-[56px] leading-none font-black tracking-tight",
            style: { color: "#1C2A4A", WebkitTextStroke: "2px #1C2A4A", textShadow: "6px 6px 0 #1C2A4A" },
            children: ["BEAT", h("span", { style: { color: "#FFE14A" }, children: "CRAFT" })],
          }),
          h("div", {
            className:
              "absolute -right-10 -top-3 rotate-12 bg-[#FF3B3B] text-white border-2 border-[#1C2A4A] px-2.5 py-0.5 rounded-full text-[12px] font-black",
            children: "v3 全新挑戰!",
          }),
        ],
      }),
      h("div", {
        className: "mt-4 flex justify-center",
        children: h("div", {
          className: "w-full max-w-[300px]",
          children: [
            h(ModeToggle, { mode, onChange: onModeChange }),
            h("div", {
              className: "mt-2 text-[11px] font-bold opacity-60",
              children: mode === "1P" ? "單人：D F J K 全控制" : "雙人：藍隊 D F vs 粉隊 J K，左右分邊對戰",
            }),
          ],
        }),
      }),
      h("div", {
        className: "mt-4 bg-[#EFF6FF] chunky-sm p-4 text-left",
        children: [
          h("p", {
            className: "fredoka text-[15px] font-bold leading-[1.5]",
            children: "玩法：跟著節拍點擊！音符掉到打擊線時按下對應顏色。",
          }),
          h(KeyLegend, { mode }),
          h("p", {
            className: "mt-3 text-[12px] opacity-70 font-bold",
            children: "💡 魔王關音符會左右亂飄！雙人對戰各顧各的2軌，錯邊會顯示「不是你的！」",
          }),
        ],
      }),
      h("button", {
        onClick: onStart,
        className: "mt-5 w-full fredoka text-[20px] font-black tracking-wide py-4 chunky bg-[#FFE14A] btn-press transition-all hover:brightness-105",
        style: { borderRadius: 20 },
        children: "開始遊戲 ▶",
      }),
      h("div", {
        className: "mt-4 grid grid-cols-3 gap-2 text-[11px] font-bold",
        children: FEATURES.map(([background, label]) =>
          h("div", { className: `${background} border-2 border-[#1C2A4A] rounded-xl py-2`, children: label }, label),
        ),
      }),
    ],
  });
}
