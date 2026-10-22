// Small presentational pieces shared across screens. Components here must not use hooks.
import { h } from "../../runtime.js";

export function ModeToggle({ mode, onChange, compact = false }) {
  return h("div", {
    className: `flex p-1 rounded-full bg-[#1C2A4A] border-2 border-[#1C2A4A] ${compact ? "text-[11px]" : "text-[13px]"} fredoka font-black`,
    children: ["1P", "2P"].map((value) =>
      h(
        "button",
        {
          onClick: () => onChange(value),
          className: `flex-1 px-3 py-1.5 rounded-full transition-all ${mode === value ? "bg-white text-[#1C2A4A] shadow-[2px_2px_0_#1C2A4A]" : "text-white/70 hover:text-white"}`,
          children: value === "1P" ? "單人模式" : "雙人對戰",
        },
        value,
      ),
    ),
  });
}

// `activeClass` must be a literal class name present in the prebuilt CSS in index.html.
export function Switch({ label, on, onToggle, activeClass }) {
  return h("label", {
    className: "flex items-center justify-between gap-2 px-3 py-2 rounded-xl border-2 border-[#1C2A4A] bg-[#EFF6FF] cursor-pointer",
    children: [
      h("span", { className: "text-[12px] font-black", children: label }),
      h("button", {
        onClick: onToggle,
        className: `w-[46px] h-[26px] rounded-full border-2 border-[#1C2A4A] relative transition-colors ${on ? activeClass : "bg-white"}`,
        children: h("span", {
          className: "absolute top-[2px] w-[18px] h-[18px] rounded-full bg-[#1C2A4A] transition-all",
          style: { left: on ? "22px" : "2px" },
        }),
      }),
    ],
  });
}

// A row of `max` icons where the first `count` are fully opaque.
export function IconMeter({ count, max = 3, icon, className, dimOpacity = 0.2 }) {
  return Array.from({ length: max }, (_, i) =>
    h("span", { className, style: { opacity: i < count ? 1 : dimOpacity }, children: icon }, i),
  );
}
