import { LOAD_HOT, LOAD_WARN } from "../constants.ts";

export function getLoadStatus(v: number): string {
  if (v >= LOAD_HOT) return "High";
  if (v >= LOAD_WARN) return "Medium";
  return "Normal";
}