export type ColorPaletteTheme = "default" | "samsung" | "google";

export interface ColorPalette {
  theme: ColorPaletteTheme;
  label: string;
  colors: string[];
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    theme: "default",
    label: "기본",
    colors: [
      "#616161",
      "#d50000",
      "#e67c73",
      "#f4511e",
      "#f6bf26",
      "#fbd75b",
      "#ffb878",
      "#33b679",
      "#0b8043",
      "#7ae7bf",
      "#039be5",
      "#3f51b5",
      "#5484ed",
      "#a4bdfc",
      "#46d6db",
      "#8e24aa",
      "#dbadff",
      "#e1e1e1",
      "#795548",
      "#424242",
      "#ff6b9d",
      "#af52de",
      "#ffd60a",
      "#34c759",
    ],
  },
  {
    theme: "samsung",
    label: "Samsung",
    colors: [
      "#e53935",
      "#f06292",
      "#ff7043",
      "#ff8a65",
      "#ffb74d",
      "#ffd54f",
      "#fff176",
      "#aed581",
      "#81c784",
      "#4db6ac",
      "#4dd0e1",
      "#4fc3f7",
      "#64b5f6",
      "#7986cb",
      "#9575cd",
      "#ba68c8",
      "#ce93d8",
      "#a1887f",
      "#bcaaa4",
      "#90a4ae",
      "#b0bec5",
      "#e57373",
      "#7986cb",
      "#8d6e63",
    ],
  },
  {
    theme: "google",
    label: "Google",
    colors: [
      "#d50000",
      "#e67c73",
      "#f4511e",
      "#ff6d00",
      "#f6bf26",
      "#fbd75b",
      "#33b679",
      "#0b8043",
      "#7ae7bf",
      "#039be5",
      "#3f51b5",
      "#5484ed",
      "#a4bdfc",
      "#8e24aa",
      "#dbadff",
      "#616161",
      "#9e9e9e",
      "#795548",
      "#a79b8e",
      "#ff6b9d",
      "#46d6db",
      "#1e88e5",
      "#43a047",
      "#c0ca33",
    ],
  },
];

export function getPalette(theme: ColorPaletteTheme) {
  return COLOR_PALETTES.find((palette) => palette.theme === theme) ?? COLOR_PALETTES[0];
}
