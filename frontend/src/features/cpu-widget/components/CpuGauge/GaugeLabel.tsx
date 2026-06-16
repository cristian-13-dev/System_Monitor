import {NUMBER_STYLE} from '../../constants.ts';

type Props = {
  usage: number;
};

export function GaugeLabel({usage}: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-8">
      <div
        className="text-[24px] font-semibold leading-none tracking-tight text-white/92"
        style={NUMBER_STYLE}>
        {usage}
        <span className="ml-1 text-[11px] font-medium text-white/55">%</span>
      </div>

      <p className="mt-1.5 text-[9px] uppercase tracking-[0.3em] text-white/46">
        CPU Load
      </p>
    </div>
  );
}