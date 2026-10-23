// Sound and accessibility toggles shown below the game card.
import { h } from "../../runtime.js";
import { Switch } from "./common.js";

const SWITCHES = [
  ["sound", "音效開關", "bg-[#7BE38B]"],
  ["music", "背景音樂", "bg-[#7CC8FF]"],
  ["reduceMotion", "減少動態", "bg-[#FF7D9D]"],
];

export function SettingsPanel({ settings, onToggle }) {
  return h("div", {
    className: "mt-4 chunky bg-white p-3 sm:p-4 flex flex-col gap-3",
    children: [
      h("div", {
        className: "flex items-center justify-between",
        children: [
          h("span", { className: "fredoka text-[12px] font-black tracking-widest", children: "音效與無障礙" }),
          h("span", { className: "text-[10px] font-bold opacity-50", children: "BeatCraft v3 友善模式" }),
        ],
      }),
      h("div", {
        className: "grid grid-cols-1 sm:grid-cols-3 gap-2",
        children: SWITCHES.map(([key, label, activeClass]) =>
          h(Switch, { label, activeClass, on: settings[key], onToggle: () => onToggle(key) }, key),
        ),
      }),
      h("p", {
        className: "text-[11px] leading-[1.5] opacity-60 font-medium",
        children:
          "以 D F J K 或觸控按鍵遊玩。空白鍵暫停，切換視窗也會自動暫停。單人標準速度最高分與星星會儲存在目前瀏覽器；練習模式可自由體驗全部關卡。",
      }),
    ],
  });
}
