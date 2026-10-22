// Result screen: score summary, story image sharing and next actions.
import { h } from "../../runtime.js";
import { starsFor } from "../../progress.js";
import { LANE_COLORS } from "../constants.js";
import { hitRate, resultTitle, winnerOf } from "../game/rules.js";
import { shareCaption } from "../game/shareCard.js";

function titleColor(mode, score) {
  if (mode === "2P") return "#1C2A4A";
  if (score >= 2000) return "#2ECC71";
  if (score >= 1000) return "#1C2A4A";
  return "#FF5A5F";
}

function StatTile({ label, value, valueClass = "" }) {
  return h("div", {
    className: "bg-white border-2 border-[#1C2A4A] rounded-xl py-2",
    children: [
      h("div", { className: "text-[10px] font-black opacity-60", children: label }),
      h("div", { className: `fredoka text-[18px] font-black ${valueClass}`, children: value }),
    ],
  });
}

function SoloSummary({ player }) {
  const stars = starsFor(player.score);
  return h("div", {
    className: "mt-4 chunky-sm bg-[#EFF6FF] p-4",
    children: [
      h("div", { className: "fredoka text-[12px] font-black tracking-widest opacity-60", children: "本次得分" }),
      h("div", {
        className: "fredoka text-[52px] leading-none font-black mt-1",
        style: { color: "#1C2A4A" },
        children: [player.score, h("span", { className: "text-[22px] ml-1", children: "分" })],
      }),
      h("div", {
        className: "mt-3 flex justify-center gap-1.5",
        children: [1, 2, 3].map((n) =>
          h(
            "span",
            {
              className: "text-[28px]",
              style: { opacity: stars >= n ? 1 : 0.18, filter: stars >= n ? "drop-shadow(2px 2px 0 #1C2A4A)" : "none" },
              children: "⭐",
            },
            n,
          ),
        ),
      }),
      h("div", {
        className: "mt-4 grid grid-cols-3 gap-2",
        children: [
          h(StatTile, { label: "最高連擊", value: player.maxCombo }),
          h(StatTile, { label: "完美", value: player.perfect, valueClass: "text-[#2ECC71]" }),
          h(StatTile, { label: "不錯", value: player.good }),
        ],
      }),
    ],
  });
}

function TeamResult({ title, player, won, background }) {
  return h("div", {
    className: `p-3 rounded-xl border-2 border-[#1C2A4A] ${won ? background : "bg-white"}`,
    children: [
      h("div", { className: "text-[11px] font-black", children: [title, " ", won ? "👑" : ""] }),
      h("div", {
        className: "fredoka text-[28px] font-black",
        children: [player.score, h("span", { className: "text-[14px]", children: "分" })],
      }),
      h("div", { className: "text-[10px] font-bold", children: ["連擊 ", player.maxCombo, " · 完美 ", player.perfect] }),
    ],
  });
}

function VersusSummary({ players }) {
  const winner = winnerOf(players);
  const { p1, p2 } = players;
  return h("div", {
    className: "mt-4 chunky-sm bg-[#EFF6FF] p-3",
    children: [
      h("div", {
        className: "grid grid-cols-[1fr_auto_1fr] gap-2 items-center",
        children: [
          h(TeamResult, { title: "藍隊 P1", player: p1, won: winner === "藍隊", background: "bg-[#7CC8FF]" }),
          h("div", { className: "fredoka text-[18px] font-black", children: "VS" }),
          h(TeamResult, { title: "粉隊 P2", player: p2, won: winner === "粉隊", background: "bg-[#FF7D9D]" }),
        ],
      }),
      h("div", {
        className: "mt-3 text-[12px] font-black opacity-70",
        children: winner === "平手" ? "平手！都很強！" : `${winner} 以 ${Math.abs(p1.score - p2.score)} 分差獲勝！`,
      }),
    ],
  });
}

const shareButtonClass = "w-full fredoka chunky-sm py-2.5 text-[13px] font-black btn-press flex items-center justify-center gap-1";

function SharePanel({ game, share }) {
  return h("div", {
    className: "mt-5 chunky-sm bg-white p-3 text-left overflow-hidden",
    children: [
      h("div", {
        className: "flex justify-between items-center mb-2",
        children: [
          h("h4", {
            className: "fredoka text-[16px] font-black flex items-center gap-2",
            children: [
              "炫耀一下！ ",
              h("span", {
                className: "text-[11px] px-2 py-0.5 rounded-full bg-[#FFE14A] border-2 border-[#1C2A4A]",
                children: "1080x1920 限動",
              }),
            ],
          }),
          h("span", { className: "text-[10px] font-bold opacity-50", children: "v3 分享版" }),
        ],
      }),
      h("div", {
        className: "grid grid-cols-[110px_1fr] gap-3",
        children: [
          h("div", {
            className: "relative",
            children: [
              h("canvas", { ref: share.canvasRef, width: 1080, height: 1920, className: "hidden" }),
              share.imageUrl
                ? h("img", {
                    src: share.imageUrl,
                    alt: "限動預覽",
                    className: "w-full aspect-[9/16] object-cover rounded-xl border-2 border-[#1C2A4A] shadow-[3px_3px_0_#1C2A4A]",
                  })
                : h("div", {
                    className:
                      "w-full aspect-[9/16] rounded-xl border-2 border-dashed border-[#1C2A4A]/30 bg-[#EFF6FF] flex items-center justify-center text-[11px] font-bold opacity-60",
                    children: "生成中...",
                  }),
              h("div", {
                className: "absolute -bottom-2 -right-2 bg-[#7BE38B] border-2 border-[#1C2A4A] text-[9px] font-black px-1.5 py-0.5 rounded-full",
                children: "HD",
              }),
            ],
          }),
          h("div", {
            className: "flex flex-col gap-2",
            children: [
              h("div", {
                className: "bg-[#1C2A4A] text-white rounded-xl p-2.5",
                children: [
                  h("div", { className: "text-[11px] font-black opacity-70", children: "限動文案" }),
                  h("div", {
                    className: "text-[12px] font-bold leading-[1.4] mt-1",
                    children: shareCaption(game.mode, game.level, game.players),
                  }),
                ],
              }),
              h("button", { onClick: share.download, className: `${shareButtonClass} bg-[#FFE14A]`, children: "⬇ 下載限動圖" }),
              h("button", {
                onClick: share.copyText,
                className: `${shareButtonClass} bg-white`,
                children: share.copied ? "✅ 已複製！" : "📋 複製文字",
              }),
              share.canShare &&
                h("button", { onClick: share.share, className: `${shareButtonClass} bg-[#7CC8FF]`, children: "↗ 分享到 IG / Threads" }),
              h("div", {
                className: "flex gap-1.5 mt-1",
                children: [
                  ...LANE_COLORS.map((color) =>
                    h("div", { className: "w-3 h-3 rounded-full border-2 border-[#1C2A4A]", style: { background: color } }, color),
                  ),
                  h("span", { className: "text-[10px] font-bold opacity-50 ml-1", children: "canvas 繪製 • 高清直出" }, "label"),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

export function ResultScreen({ game, share }) {
  const { mode, level, players, isDemon } = game;
  return h("div", {
    className: "text-center py-3",
    children: [
      h("p", {
        style: { fontWeight: 900, marginBottom: 12 },
        children: `命中率 ${hitRate(players)}% · ${game.ranked ? "標準挑戰 · 自動保存本機紀錄" : "本次不列入單人紀錄"}`,
      }),
      h("div", {
        className: "inline-block px-4 py-1 rounded-full bg-[#1C2A4A] text-white text-[11px] font-black tracking-widest mb-3",
        children: ["Lv", level.id, " ", level.name, " · ", level.bpm, " BPM ", mode === "2P" ? "· 雙人對戰" : "", " ", isDemon ? "🔥" : ""],
      }),
      h("h3", {
        className: "fredoka text-[30px] sm:text-[34px] font-black leading-none",
        style: { color: titleColor(mode, players.p1.score) },
        children: resultTitle(mode, players),
      }),
      mode === "1P" ? h(SoloSummary, { player: players.p1 }) : h(VersusSummary, { players }),
      h(SharePanel, { game, share }),
      h("div", {
        className: "mt-4 grid grid-cols-2 gap-3",
        children: [
          h("button", {
            onClick: game.restart,
            className: "fredoka chunky py-3.5 bg-white font-black btn-press",
            children: mode === "2P" ? "再戰一場" : "再玩一次",
          }),
          h("button", {
            onClick: game.nextLevel,
            className: "fredoka chunky py-3.5 bg-[#FFE14A] font-black btn-press",
            children: game.hasNextLevel ? "下一關 →" : "選關卡",
          }),
        ],
      }),
      h("button", { onClick: game.openMenu, className: "mt-3 text-[12px] font-bold opacity-60 underline", children: "回首頁" }),
    ],
  });
}
