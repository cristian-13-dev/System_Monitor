import type { BandwidthStatus } from "../types";

export function getBandwidthStatus(download: number, upload: number): BandwidthStatus {
  const combined = download + upload;

  if (combined >= 600) {
    return {
      label: "Busy",
      toneClass: "text-[#d83d3d]",
    };
  }

  if (combined >= 300) {
    return {
      label: "Active",
      toneClass: "text-[#d8a23d]",
    };
  }

  return {
    label: "Idle",
    toneClass: "text-[#3dd886]",
  };
}