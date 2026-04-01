import type { BandwidthStatus } from "../types";

export function getBandwidthStatus(download: number, upload: number): BandwidthStatus {
  const combined = download + upload;

  if (combined >= 120) {
    return {
      label: "Very High",
      toneClass: "text-red-300",
      iconTone: "text-red-300",
    };
  }

  if (combined >= 80) {
    return {
      label: "High",
      toneClass: "text-amber-400",
      iconTone: "text-amber-400",
    };
  }

  return {
    label: "Low",
    toneClass: "text-[#3dd886]",
    iconTone: "text-[#3dd886]",
  };
}