import { Gauge, Wifi } from "lucide-react";
import type { BandwidthStatus } from "../types";

type Props = {
  bandwidthStatus: BandwidthStatus;
};

export function NetworkHeader({ bandwidthStatus }: Props) {
  return (
    <div className="flex gap-3 border-b border-white/6 px-4 py-3 flex-row items-center justify-between sm:px-5 sm:py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-white/85 sm:h-11 sm:w-11">
          <Wifi size={21} />
        </div>

        <div>
          <div className="text-[15px] font-medium text-white/92">Network activity</div>
          <div className="mt-0.5 text-xs text-white/46">
            Real-time download, upload and latency data
          </div>
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-[10px] border border-white/8 bg-white/3 px-3 py-1.5 text-sm text-white/72 self-auto">
        <Gauge size={14}  />
        <span className={`font-medium ${bandwidthStatus.toneClass}`}>
          {bandwidthStatus.label}
        </span>
      </div>
    </div>
  );
}