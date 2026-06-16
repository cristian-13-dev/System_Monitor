import {CpuBar} from './CpuBar';
import { HISTORY_SIZE } from "../../constants.ts";

type Props = {
  history: number[];
};

export function CpuHistoryBar({ history }: Props) {
  const paddedHistory = [
    ...Array(HISTORY_SIZE - history.length).fill(null),
    ...history,
  ];

  return (
    <div className="mt-3 flex items-center gap-1">
      {paddedHistory.map((value, index) => (
        <CpuBar key={index} value={value} />
      ))}
    </div>
  );
}