import { useIsMobile } from "../hooks/useIsMobile";
import { useNetworkMetrics } from "../hooks/useNetworkMetrics";
import { useNetworkChart } from "../hooks/useNetworkChart";
import { NetworkChart } from "./NetworkChart";
import { NetworkHeader } from "./NetworkHeader";
import { NetworkStats } from "./NetworkStats";

export default function NetworkWidget() {
  const isMobile = useIsMobile();
  const { points, error } = useNetworkMetrics();

  const {
    chartPoints,
    latest,
    maxValue,
    avgDownload,
    avgUpload,
    avgDelay,
    startTimestamp,
    endTimestamp,
    bandwidthStatus,
  } = useNetworkChart(points);

  return (
    <div className="min-h-screen bg-zinc-950/95 p-2 text-white sm:p-6">
      <div className="w-full max-w-180 rounded-[18px] border border-white/6 bg-zinc-900 shadow-[0_18px_50px_rgba(0,0,0,0.42)]">
        <NetworkHeader bandwidthStatus={bandwidthStatus} />

        <div className="px-0 pt-2 sm:px-0 sm:pt-4">
          <NetworkChart
            chartPoints={chartPoints}
            maxValue={maxValue}
            startTimestamp={startTimestamp}
            endTimestamp={endTimestamp}
            isMobile={isMobile}
          />
        </div>

        <NetworkStats
          latestDownload={latest.download}
          latestUpload={latest.upload}
          avgDownload={avgDownload}
          avgUpload={avgUpload}
          avgDelay={avgDelay}
        />

        {error ? (
          <div className="border-t border-white/6 px-5 py-3 text-sm text-white/42">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}