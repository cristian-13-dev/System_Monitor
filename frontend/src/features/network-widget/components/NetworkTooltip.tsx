import {formatDelay, formatSpeed, formatTickLabel} from "../utils/format";
import type {NetworkPoint} from "../types";

type Props = {
  point: NetworkPoint;
  x: number;
  y: number;
  width: number;
  height: number;
  isMobile: boolean;
};

export function NetworkTooltip({point, x, y, width, height, isMobile}: Props) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        width={width}
        height={height}
        rx="12"
        fill="rgba(18,20,27,0.52)"
        stroke="rgba(255,255,255,0.08)"
      />
      <path
        d={`M0,12 Q0,0 12,0 L${width - 12},0 Q${width},0 ${width},12 L${width},28 L0,28 Z`}
        fill="rgba(255,255,255,0.045)"
      />

      <text x="12" y="18" fontSize={isMobile ? 13 : 11} fontWeight="700" fill="rgba(255,255,255,0.96)">
        {point.timestamp ? formatTickLabel(point.timestamp) : "Waiting for data"}
      </text>

      <line x1="14" x2="14" y1="40" y2="52" stroke="rgba(110,135,255,1)" strokeWidth="2.5" strokeLinecap="round"/>
      <text x="24" y="49" fontSize={isMobile ? 13 : 11} fill="rgba(255,255,255,0.72)">
        Download
      </text>
      <text x={width - 12} y="49" textAnchor="end" fontSize={isMobile ? 13 : 11} fill="rgba(255,255,255,0.52)">
        {formatSpeed(point.download)}
      </text>

      <line x1="14" x2="14" y1="59" y2="71" stroke="rgba(61,216,134,1)" strokeWidth="2.5" strokeLinecap="round"/>
      <text x="24" y="68" fontSize={isMobile ? 13 : 11} fill="rgba(255,255,255,0.72)">
        Upload
      </text>
      <text x={width - 12} y="68" textAnchor="end" fontSize={isMobile ? 13 : 11} fill="rgba(255,255,255,0.52)">
        {formatSpeed(point.upload)}
      </text>

      <line x1="14" x2="14" y1="78" y2="90" stroke="rgba(251,191,36,0.95)" strokeWidth="2.5" strokeLinecap="round"/>
      <text x="24" y="87" fontSize={isMobile ? 13 : 11} fill="rgba(255,255,255,0.72)">
        Delay
      </text>
      <text x={width - 12} y="87" textAnchor="end" fontSize={isMobile ? 13 : 11} fill="rgba(255,255,255,0.52)">
        {formatDelay(point.delay)}
      </text>
    </g>
  );
}