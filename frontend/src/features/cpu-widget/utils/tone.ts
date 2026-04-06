import {COLOR} from "../constants.ts";
import type {HashString} from "../types.ts";
import {TEMP_WARN, TEMP_HOT} from "../constants.ts";

export function getTone(value: number): HashString {
  if (value >= TEMP_HOT) return COLOR.hot;
  if (value >= TEMP_WARN) return COLOR.warn;
  return COLOR.good;
}
