import type {MemoryData} from '../types';

export function getDisplayedMemoryType(data: MemoryData): string {
  return data.layout[0]?.type || data.summary.type || "Unknown";
}

export function getDisplayedFrequencyMHz(data: MemoryData): number | null {
  return data.layout[0]?.clockSpeedMHz || data.summary.frequencyMHz || null;
}