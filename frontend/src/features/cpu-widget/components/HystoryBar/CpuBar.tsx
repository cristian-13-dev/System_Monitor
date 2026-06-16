import {COLOR} from '../../constants';
import {getTone} from '../../utils/tone.ts';

type CpuBarProps = {
  value: number | null;
};

export const CpuBar = ({ value }: CpuBarProps) => {
  const isEmpty = value === null;

  return (
    <div
      title={!isEmpty ? `${value}%` : undefined}
      className="h-3 flex-1 rounded-[3px] transition-colors duration-500"
      style={{
        backgroundColor: isEmpty ? COLOR.track : getTone(value),
        opacity: isEmpty ? 0.3 : 0.85,
      }}
    />
  );
}