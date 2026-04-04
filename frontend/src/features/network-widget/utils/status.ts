import { COLOR } from "../constants";
import type { BandwidthStatus } from "../types";

export function getBandwidthStatus(download: number, upload: number): BandwidthStatus {
  const combined = download + upload;

  if (combined >= 400) {
    return {label: "Busy", tone: COLOR.hot};
  }

  if (combined >= 200) {
    return {label: "Active", tone: COLOR.warn};
  }

  return {label: "Idle", tone: COLOR.good};
}