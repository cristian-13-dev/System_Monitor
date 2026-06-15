import type {MemoryRaw, MemoryData} from "../types"
import {COMMON_MEMORY_SIZES} from '../constants'

export function getRealUsedPct(raw: MemoryRaw): number {
  return ((raw.total - raw.available) / raw.total) * 100;
}

export function getRoundedInstalledCapacityGB(data: MemoryData): number {
  const slotTotal = data.layout.reduce((sum, slot) => sum + slot.size, 0);
  const sourceTotal = slotTotal > 0 ? slotTotal : data.raw.total;

  let closest = COMMON_MEMORY_SIZES[0];
  let minDiff = Math.abs(sourceTotal - closest);

  for (const size of COMMON_MEMORY_SIZES) {
    const diff = Math.abs(sourceTotal - size);
    if (diff < minDiff) {
      minDiff = diff;
      closest = size;
    }
  }

  return closest;
}