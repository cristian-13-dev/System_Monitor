import {apiUrl} from "../network-widget/constants.ts";

export const API_URL = `${apiUrl}/memory`;
export const POLL_MS = 2_000;
export const BAR_COUNT = 12;

export const COMMON_MEMORY_SIZES = [2, 4, 6, 8, 12, 16, 24, 32, 36, 48, 64, 96, 128, 192, 256];

export const COLOR = {
  good: "#3dd886",
  warm: "#d8a23d",
  hot: "#d83d3d",
  swap: "#7c6ef7",
  cached: "#e8832a",
  track: "rgba(255,255,255,0.06)",
};