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

function TooltipBody({
                       point,
                       isMobile,
                       floating = false,
                     }: {
  point: { download?: number | string; upload?: number | string };
  isMobile: boolean;
  floating?: boolean;
}) {
  const wrapperClass = isMobile
    ? "pointer-events-none w-38 rounded-xl border border-white/8 bg-[#0F1117]/95 px-2 py-1.5 shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur"
    : `pointer-events-none ${floating ? "w-44 rounded-2xl" : "w-44 rounded-xl"} border border-white/10 bg-[#0F1117]/95 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur`;

  const rowGapClass = isMobile ? "space-y-1.5" : "space-y-2";
  const labelClass = isMobile ? "text-[11px]" : "text-xs";
  const valueClass = isMobile ? "text-[11px] font-semibold text-white" : "text-xs font-semibold text-white";
  const markerClass = isMobile ? "h-2.5 w-0.5 rounded-full" : floating ? "h-2 w-2 rounded-full" : "h-4 w-1 rounded-full";

  return (
    <div className={wrapperClass}>
      <div className={rowGapClass}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-white/72">
            <span className={`${markerClass} bg-[rgba(110,135,255,0.98)]`} />
            <span className={labelClass}>Download</span>
          </div>
          <span className={valueClass}>
            {Number(point.download ?? 0).toFixed(2)} Mbps
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-white/72">
            <span className={`${markerClass} bg-[rgba(61,216,134,0.96)]`} />
            <span className={labelClass}>Upload</span>
          </div>
          <span className={valueClass}>
            {Number(point.upload ?? 0).toFixed(2)} Mbps
          </span>
        </div>
      </div>
    </div>
  );
}

export function NetworkTooltipContent({ active, payload, isMobile }: TooltipComponentProps) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div
      style={{
        transform: isMobile
          ? "translate(-50%, calc(-100% - 10px))"
          : "translate(-50%, calc(-100% - 14px))",
      }}
    >
      <TooltipBody point={point} isMobile={isMobile} />
    </div>
  );
}

export function NetworkTooltip(props: TooltipComponentProps | FloatingTooltipProps) {
  if ((props as TooltipComponentProps).active !== undefined) {
    const p = props as TooltipComponentProps;
    return <NetworkTooltipContent {...p} />;
  }

  const { point, x, y, width, height, isMobile } = props as FloatingTooltipProps;

  if (!point) return null;

  return (
    <foreignObject x={x} y={y} width={width} height={height} pointerEvents="none">
      <div style={{ transform: "translate(-50%, 0)" }}>
        <TooltipBody point={point} isMobile={isMobile} floating />
      </div>
    </foreignObject>
  );
}

export default NetworkTooltip;