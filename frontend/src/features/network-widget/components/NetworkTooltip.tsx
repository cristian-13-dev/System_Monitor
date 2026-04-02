// Note: intentionally not importing Recharts tooltip types here to keep the
// component flexible for both Recharts content and the in-chart floating tooltip.

type TooltipComponentProps = {
  active?: boolean;
  payload?: Array<{ payload?: { download?: number | string; upload?: number | string } }>;
  isMobile: boolean;
};

type FloatingTooltipProps = {
  point: { download?: number | string; upload?: number | string };
  x: number;
  y: number;
  width: number;
  height: number;
  isMobile: boolean;
};

export function NetworkTooltipContent({active, payload, isMobile}: TooltipComponentProps) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div
      className="pointer-events-none w-44 rounded-xl border border-white/10 bg-[#0F1117]/95 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur"
      style={{transform: "translate(-50%, calc(-100% - 14px))"}}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white/72">
            <span className="h-4 w-1 rounded-full bg-[rgba(110,135,255,0.98)]"/>
            <span className={isMobile ? "text-sm" : "text-xs"}>Download</span>
          </div>
          <span className={isMobile ? "text-sm font-semibold text-white" : "text-xs font-semibold text-white"}>
            {Number(point.download).toFixed(2)} Mbps
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white/72">
            <span className="h-4 w-1 rounded-full bg-[rgba(61,216,134,0.96)]"/>
            <span className={isMobile ? "text-sm" : "text-xs"}>Upload</span>
          </div>
          <span className={isMobile ? "text-sm font-semibold text-white" : "text-xs font-semibold text-white"}>
            {Number(point.upload).toFixed(2)} Mbps
          </span>
        </div>
      </div>
    </div>
  );
}

export function NetworkTooltip(props: TooltipComponentProps | FloatingTooltipProps) {
  if ((props as TooltipComponentProps).active !== undefined) {
    const p = props as TooltipComponentProps;
    return <NetworkTooltipContent {...p} />;
  }

  const {point, x, y, width, height, isMobile} = props as FloatingTooltipProps;

  if (!point) return null;

  return (
    <foreignObject x={x} y={y} width={width} height={height} pointerEvents="none">
      <div
        className="pointer-events-none w-44 rounded-2xl border border-white/10 bg-[#0F1117]/95 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur"
        style={{transform: 'translate(-50%, 0)'}}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-white/72">
              <span className="h-2 w-2 rounded-full bg-[rgba(110,135,255,0.98)]"/>
              <span className={isMobile ? "text-sm" : "text-xs"}>Download</span>
            </div>
            <span className={isMobile ? "text-sm font-semibold text-white" : "text-xs font-semibold text-white"}>
              {Number(point.download).toFixed(2)} Mbps
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-white/72">
              <span className="h-2 w-2 rounded-full bg-[rgba(61,216,134,0.96)]"/>
              <span className={isMobile ? "text-sm" : "text-xs"}>Upload</span>
            </div>
            <span className={isMobile ? "text-sm font-semibold text-white" : "text-xs font-semibold text-white"}>
              {Number(point.upload).toFixed(2)} Mbps
            </span>
          </div>
        </div>
      </div>
    </foreignObject>
  );
}

export default NetworkTooltip;

