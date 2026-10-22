// Shared visual, input and timing constants.
export const INK = "#1C2A4A";
export const LANE_COLORS = ["#7CC8FF", "#FFE14A", "#FF7D9D", "#7BE38B"];
export const LANE_KEYS = ["D", "F", "J", "K"];
export const KEY_TO_LANE = { d: 0, f: 1, j: 2, k: 3 };

// Vertical positions are percentages of the playfield height.
export const HIT_LINE = 86;
export const SPAWN_Y = -12;
export const MISS_Y = 96;

export const MAX_LIVES = 3;
export const COUNTDOWN_SECONDS = 3;
export const SPEEDS = [0.75, 1, 1.25];

export const DEFAULT_SETTINGS = { sound: true, music: true, reduceMotion: false };

export const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;900&family=Noto+Sans+TC:wght@500;700;900&family=Nunito:wght@700;800&display=swap";
