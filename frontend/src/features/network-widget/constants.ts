import type { Padding } from "./types";

export const API_URL = "http://100.93.206.41:3001/api/metrics";
export const MAX_POINTS = 16;

export const SVG_WIDTH = 640;
export const SVG_HEIGHT = 320;

export const PADDING: Padding = {
  top: 0,
  right: 0,
  bottom: 28,
  left: 0,
};

export const DESKTOP_LABEL_COUNT = 7;
export const MOBILE_LABEL_COUNT = 4;
export const DESKTOP_Y_TICKS = [0.2, 0.4, 0.6, 0.8, 1];
export const MOBILE_Y_TICKS = [0.25, 0.5, 0.75, 1];
export const POLLING_INTERVAL_MS = 1000;
