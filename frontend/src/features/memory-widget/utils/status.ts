import {COLOR} from "../constants"

const {good, warm, hot} = COLOR;

export function getRamAccent(usedPct: number): string {
  if (usedPct < 80) return good;
  if (usedPct < 90) return warm;
  return hot;
}

export function getPressureAccent(p: number): string {
  if (p < 70) return good;
  if (p < 85) return warm;
  return hot;
}

export function getPressureLabel(p: number): string {
  if (p < 70) return "Balanced";
  if (p < 85) return "Medium";
  return "High";
}