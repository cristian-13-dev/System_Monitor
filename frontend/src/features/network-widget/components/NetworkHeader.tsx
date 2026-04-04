import { Wifi } from "lucide-react";
import type { BandwidthStatus } from "../types";

type Props = {
  bandwidthStatus: BandwidthStatus;
};

export function NetworkHeader({ bandwidthStatus }: Props) {
  const tone = bandwidthStatus.tone;

  return (
    <div className="flex gap-3 border-b border-white/6 px-4 py-3 flex-row items-center justify-between sm:px-5 sm:py-4">
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
      `}</style>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-white/85 sm:h-11 sm:w-11">
          <Wifi size={21} />
        </div>
        <div>
          <div className="text-[15px] font-medium text-white/92">Network activity</div>
          <div className="mt-0.5 text-xs text-white/46">
            Download, upload and latency data
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-2 rounded-lg border px-3 py-1.5"
        style={{ borderColor: `${tone}28`, background: `${tone}0f` }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor: tone,
            boxShadow: `0 0 6px ${tone}`,
            animation: "pulse 2.5s ease-in-out infinite",
          }}
        />
        <span className="text-[12px] font-medium" style={{ color: tone }}>
          {bandwidthStatus.label}
        </span>
      </div>
    </div>
  );
}