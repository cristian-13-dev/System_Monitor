import {LEGEND} from "../../constants.ts";

export const Header = () => {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <h1 className="text-[9px] uppercase tracking-[0.22em] text-white/46">
        Per-core
      </h1>

      <div className="flex items-center gap-4">
        {LEGEND.map(({label, color}) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="h-1.5 w-2.5 rounded-xs" style={{backgroundColor: color}}/>
            <span className="text-[9px] uppercase tracking-[0.18em] text-white/46">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}