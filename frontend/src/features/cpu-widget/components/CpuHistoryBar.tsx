import {getTone} from "../utils/tone.ts";
import {COLOR, HISTORY_SIZE} from "../constants.ts";

export const CpuHistoryBar = ({history}: {history: number[]}) => {
  const paddedHistory = [
    ...Array(HISTORY_SIZE - history.length).fill(null),
    ...history,
  ] as (number | null)[];

  return <div className="mt-3 flex items-center gap-1">
    {paddedHistory.map((v, i) => (
      <div
        key={i}
        title={v != null ? `${v}%` : undefined}
        className="h-3 flex-1 rounded-[3px] transition-colors duration-500"
        style={{
          backgroundColor: v != null ? getTone(v) : COLOR.track,
          opacity: v != null ? 0.85 : 0.3,
        }}
      />
    ))}
  </div>
}