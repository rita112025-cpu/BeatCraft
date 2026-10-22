// Top banner with the title copy and the idle lane animation.
import { h } from "../../runtime.js";
import { LANE_COLORS, LANE_KEYS } from "../constants.js";

const BADGES = [
  ["30秒一局", "bg-[#FFE14A]"],
  ["繁中版", "bg-[#7CC8FF] text-[#1C2A4A]"],
  ["v3 關卡擴充", "bg-[#FF3B3B] text-white"],
];
const DOT_COLORS = ["bg-[#7CC8FF]", "bg-[#FFE14A]", "bg-[#FF7D9D]", "bg-[#7BE38B]", "bg-[#FF3B3B]"];

function LaneDemo({ beat, reduceMotion }) {
  return h("div", {
    className: "flex gap-2",
    children: LANE_COLORS.map((color, lane) =>
      h(
        "div",
        {
          className:
            "w-[52px] h-[92px] sm:w-[58px] sm:h-[104px] chunky-sm flex flex-col justify-end items-center pb-2 relative overflow-hidden transition-transform",
          style: {
            background: color,
            transform: beat === lane ? "scale(1.08) translateY(-4px)" : "scale(1)",
            transition: reduceMotion ? "none" : "transform 180ms cubic-bezier(.34,1.56,.64,1)",
          },
          children: [
            h("div", {
              className: "w-8 h-8 rounded-full bg-white border-2 border-[#1C2A4A] mb-2",
              style: { opacity: beat === lane ? 1 : 0.45 },
            }),
            h("span", { className: "fredoka text-[12px] font-bold", children: LANE_KEYS[lane] }),
          ],
        },
        lane,
      ),
    ),
  });
}

export function Hero({ beat, reduceMotion }) {
  return h("div", {
    className: "chunky bg-white flex flex-col lg:flex-row items-stretch overflow-hidden",
    children: [
      h("div", {
        className: "flex-1 p-5 sm:p-7 flex flex-col justify-center gap-3",
        children: [
          h("div", {
            className: "flex items-center gap-3 flex-wrap",
            children: [
              h("span", {
                className: "fredoka text-[22px] sm:text-[26px] font-bold tracking-tight leading-none",
                style: { color: "#1C2A4A" },
                children: "BEATCRAFT",
              }),
              ...BADGES.map(([label, colors]) =>
                h(
                  "span",
                  {
                    className: `text-[11px] sm:text-xs font-black tracking-widest px-3 py-1 rounded-full ${colors} border-2 border-[#1C2A4A]`,
                    children: label,
                  },
                  label,
                ),
              ),
            ],
          }),
          h("h1", {
            className: "fredoka text-[26px] sm:text-[32px] lg:text-[36px] leading-[1.05] font-bold mt-1",
            children: ["專注、快速、", h("br", { className: "lg:hidden" }), "玩起來就是爽。"],
          }),
          h("p", {
            className: "text-[14px] sm:text-[15px] leading-[1.6] opacity-80 max-w-[38ch] font-medium",
            children: "12 道節奏挑戰，從 70 到 240 BPM。練習、變速、雙人對戰，找到你的節奏，再分享你的最佳成績。",
          }),
          h("div", {
            className: "flex gap-2 mt-1 items-center",
            children: [
              ...DOT_COLORS.map((color) => h("div", { className: `h-2 w-2 rounded-full ${color}` }, color)),
              h("span", {
                className: "ml-2 text-[11px] font-black opacity-50 tracking-widest",
                children: "NEW: 12 關卡 + 永久進度 + 練習模式",
              }),
            ],
          }),
        ],
      }),
      h("div", {
        className:
          "bg-[#EFF6FF] border-t-4 lg:border-t-0 lg:border-l-4 border-[#1C2A4A] p-4 sm:p-5 flex items-center justify-center gap-3 lg:w-[340px]",
        children: [
          h(LaneDemo, { beat, reduceMotion }),
          h("div", {
            className: "hidden sm:flex flex-col gap-2 ml-2",
            children: [
              h("div", {
                className: "px-3 py-1 rounded-full bg-white border-2 border-[#1C2A4A] text-[11px] font-black",
                children: "♪ v3 節拍",
              }),
              h("div", { className: "w-[64px] h-1.5 rounded-full bg-[#1C2A4A] opacity-20" }),
              h("div", { className: "w-[48px] h-1.5 rounded-full bg-[#1C2A4A] opacity-20" }),
              h("div", {
                className: "px-2 py-0.5 rounded-full bg-[#FF3B3B] text-white text-[10px] font-black border-2 border-[#1C2A4A]",
                children: "160 BPM 魔王",
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
