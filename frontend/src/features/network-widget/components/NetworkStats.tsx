import { ArrowDownRight, ArrowUpRight, TimerReset } from "lucide-react";
import { formatDelay, formatSpeed } from "../utils/format";
import { StatCard } from "./StatCard";

type Props = {
  latestDownload: number;
  latestUpload: number;
  avgDownload: number;
  avgUpload: number;
  avgDelay: number;
};

export function NetworkStats({
                               latestDownload,
                               latestUpload,
                               avgDownload,
                               avgUpload,
                               avgDelay,
                             }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2.5 border-t border-white/6 px-2 pb-2 pt-2 sm:gap-3 sm:px-4 sm:pb-4 sm:pt-3">
      <StatCard
        icon={<ArrowDownRight size={13} className="text-[#6e87ff]" />}
        label="Download"
        value={formatSpeed(latestDownload)}
        subtitle={`Average ${formatSpeed(avgDownload)}`}
      />

      <StatCard
        icon={<ArrowUpRight size={13} className="text-[#3dd886]" />}
        label="Upload"
        value={formatSpeed(latestUpload)}
        subtitle={`Average ${formatSpeed(avgUpload)}`}
      />

      <StatCard
        icon={<TimerReset size={13} className="text-amber-400" />}
        label="Latency"
        value={formatDelay(avgDelay)}
        subtitle="Average response"
      />
    </div>
  );
}