// Root component: owns persistent progress and settings, and routes between screens.
// All hooks live here or in custom hooks so child components stay pure render functions.
import { I as React, h } from "../runtime.js";
import { loadProgress, saveProgress } from "../progress.js";
import { DEFAULT_SETTINGS } from "./constants.js";
import { createSfx } from "./game/audio.js";
import { useGame } from "./hooks/useGame.js";
import { useGoogleFonts, useMenuBeat } from "./hooks/usePageDecor.js";
import { useShareCard } from "./hooks/useShareCard.js";
import { Hero } from "./components/Hero.js";
import { LevelSelectScreen } from "./components/LevelSelectScreen.js";
import { MenuScreen } from "./components/MenuScreen.js";
import { PlayScreen } from "./components/PlayScreen.js";
import { ResultScreen } from "./components/ResultScreen.js";
import { SettingsPanel } from "./components/SettingsPanel.js";

const GLOBAL_CSS = `
        :root { --ink:#1C2A4A; }
        .fredoka { font-family: "Fredoka", "Noto Sans TC", sans-serif; }
        .chunky { border:4px solid #1C2A4A; box-shadow:6px 6px 0 #1C2A4A; border-radius:24px; }
        .chunky-sm { border:3px solid #1C2A4A; box-shadow:4px 4px 0 #1C2A4A; border-radius:18px; }
        .hard-shadow { box-shadow:6px 6px 0 #1C2A4A; }
        .btn-press:active { transform: translate(3px,3px); box-shadow:3px 3px 0 #1C2A4A !important; }
        @keyframes pop { 0%{transform:scale(0.6) translateY(10px); opacity:0} 20%{opacity:1} 80%{opacity:1} 100%{transform:scale(1.2) translateY(-30px); opacity:0} }
        @keyframes laneFlash { 0%{background:white} 100%{background:var(--lane-col)} }
        @keyframes bounceY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes demonPulse { 0%,100%{background:#FFF0F0} 50%{background:#FFD6D6} }
        @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes floatDot { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `;

const HEADER_DOTS = ["bg-[#FF7D9D]", "bg-[#FFE14A]", "bg-[#7BE38B]"];

function CardHeader({ game }) {
  return h("div", {
    className: "flex justify-between items-center mb-3",
    children: [
      h("div", {
        className: "flex gap-1.5",
        children: HEADER_DOTS.map((color) =>
          h("div", { className: `w-3 h-3 rounded-full ${color} border-2 border-[#1C2A4A]` }, color),
        ),
      }),
      h("div", {
        className: "flex items-center gap-2",
        children: [
          h("span", { className: "text-[10px] font-black tracking-widest opacity-60", children: "BEATCRAFT v3.0 • ZH-TW" }),
          game.screen === "playing" &&
            h("span", {
              className: `text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-[#1C2A4A] ${game.isDemon ? "bg-[#FF3B3B] text-white animate-pulse" : "bg-[#1C2A4A] text-white"}`,
              children: [game.level.bpm, " BPM ", game.isDemon ? "🔥" : ""],
            }),
        ],
      }),
    ],
  });
}

function CurrentScreen({ game, share, reduceMotion }) {
  switch (game.screen) {
    case "menu":
      return h(MenuScreen, { mode: game.mode, onModeChange: game.setMode, onStart: game.openLevelSelect });
    case "levelSelect":
      return h(LevelSelectScreen, { game });
    case "playing":
      return h(PlayScreen, { game, reduceMotion });
    case "result":
      return h(ResultScreen, { game, share });
    default:
      return null;
  }
}

export function App() {
  const [progress, setProgress] = React.useState(loadProgress);
  const [settings, setSettings] = React.useState(DEFAULT_SETTINGS);
  const [sfx] = React.useState(createSfx);
  const game = useGame({ progress, setProgress, settings, sfx });
  const share = useShareCard(game);
  const menuBeat = useMenuBeat();
  useGoogleFonts();

  React.useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const toggleSetting = (key) => setSettings((current) => ({ ...current, [key]: !current[key] }));

  return h("div", {
    className: "min-h-[100dvh] w-full overflow-x-clip text-[var(--ink)]",
    style: {
      paddingTop: "var(--safe-area-inset-top)",
      background: "linear-gradient(180deg, #EFF6FF 0%, #E0EFFF 55%, #D6E8FF 100%)",
      fontFamily: '"Nunito", "Noto Sans TC", system-ui, sans-serif',
      boxSizing: "border-box",
    },
    children: [
      h("style", { children: GLOBAL_CSS }),
      h("div", {
        className: "mx-auto max-w-[980px] px-4 sm:px-6 pt-3 sm:pt-5",
        children: [
          h(Hero, { beat: menuBeat, reduceMotion: settings.reduceMotion }),
          h("div", {
            className: "mt-5 sm:mt-7 mx-auto max-w-[500px]",
            children: [
              h("div", {
                className: "chunky bg-white p-3 sm:p-4 relative overflow-hidden",
                children: [h(CardHeader, { game }), h(CurrentScreen, { game, share, reduceMotion: settings.reduceMotion })],
              }),
              h(SettingsPanel, { settings, onToggle: toggleSetting }),
              h("div", {
                className: "mt-6 mb-10 text-center text-[11px] font-bold opacity-40",
                children: "© BeatCraft v3 • 12 關卡 · 練習與變速 🔥 + 雙人對戰 + 限動分享 • Made for casual 30-second fun.",
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
