import { useState } from "react";
import {
  DESKTOP_LABEL_COUNT,
  MOBILE_LABEL_COUNT,
  PADDING,
  SVG_HEIGHT,
  SVG_WIDTH,
  Y_TICKS,
} from "../constants";
import { getAxisLabelX } from "../utils/chart";
import { formatAxisMbps, getAxisTimeLabel } from "../utils/format";
import type { ChartPoint } from "../types";
import { NetworkTooltip } from "./NetworkTooltip";

type Props = {
  chartPoints: ChartPoint[];
  maxValue: number;
  innerWidth: number;
  innerHeight: number;
  stepX: number;
  downloadLine: string;
  uploadLine: string;
  downloadArea: string;
  uploadArea: string;
  startTimestamp: number;
  endTimestamp: number;
  isMobile: boolean;
};

export function NetworkChart({
                               chartPoints,
                               maxValue,
                               innerWidth,
                               innerHeight,
                               stepX,
                               downloadLine,
                               uploadLine,
                               downloadArea,
                               uploadArea,
                               startTimestamp,
                               endTimestamp,
                               isMobile,
                             }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeIndex = hoveredIndex ?? chartPoints.length - 1;
  const activePoint = chartPoints[activeIndex];
  const isHovering = hoveredIndex !== null;

  const hoverX = PADDING.left + activeIndex * stepX;
  const hoverDownloadY = PADDING.top + innerHeight - (activePoint.download / maxValue) * innerHeight;
  const hoverUploadY = PADDING.top + innerHeight - (activePoint.upload / maxValue) * innerHeight;

  const tooltipWidth = 176;
  const tooltipHeight = 96;
  const tooltipX = Math.min(Math.max(hoverX - tooltipWidth / 2, 8), SVG_WIDTH - tooltipWidth - 8);
  const tooltipY = Math.max(
    10,
    Math.min(Math.min(hoverDownloadY, hoverUploadY) - tooltipHeight - 14, SVG_HEIGHT - tooltipHeight - 8)
  );

  const axisFontSize = isMobile ? 18 : 11;

  return (
    <svg
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      className="h-55 w-full sm:h-85"
      fill="none"
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <defs>
        <linearGradient id="downloadArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(102,126,255,0.28)" />
          <stop offset="65%" stopColor="rgba(102,126,255,0.10)" />
          <stop offset="100%" stopColor="rgba(102,126,255,0.01)" />
        </linearGradient>

        <linearGradient id="uploadArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(74,222,128,0.20)" />
          <stop offset="65%" stopColor="rgba(74,222,128,0.08)" />
          <stop offset="100%" stopColor="rgba(74,222,128,0.01)" />
        </linearGradient>
      </defs>

      {Y_TICKS.map((tick, index) => {
        const y = PADDING.top + innerHeight - innerHeight * tick;
        const label = maxValue * tick;

        return (
          <g key={index}>
            <line
              x1={PADDING.left}
              x2={SVG_WIDTH - PADDING.right}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="4 7"
              strokeWidth={isMobile ? 2 : 1}
            />
            <text x={0} y={y + 4} fontSize={axisFontSize} fill="rgba(255,255,255,0.52)">
              {formatAxisMbps(label)}
            </text>
          </g>
        );
      })}

      {chartPoints.map((_, index) => {
        const x = PADDING.left + index * stepX;
        return (
          <line
            key={`grid-${index}`}
            x1={x}
            x2={x}
            y1={PADDING.top}
            y2={SVG_HEIGHT - PADDING.bottom}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={isMobile ? 2 : 1}
          />
        );
      })}

      <path d={downloadArea} fill="url(#downloadArea)" />
      <path d={uploadArea} fill="url(#uploadArea)" />

      <path
        d={downloadLine}
        stroke="rgba(110,135,255,0.98)"
        strokeWidth={isMobile ? 4 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d={uploadLine}
        stroke="rgba(61,216,134,0.96)"
        strokeWidth={isMobile ? 4 : 2}
        strokeDasharray={isMobile ? "12 10" : "6 6"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {isHovering && (
        <>
          <line
            x1={hoverX}
            x2={hoverX}
            y1={PADDING.top}
            y2={SVG_HEIGHT - PADDING.bottom}
            stroke="rgba(255,255,255,0.16)"
          />

          <line
            x1={hoverX}
            x2={hoverX}
            y1={hoverDownloadY - 8}
            y2={hoverDownloadY + 8}
            stroke="rgba(110,135,255,1)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <line
            x1={hoverX}
            x2={hoverX}
            y1={hoverUploadY - 8}
            y2={hoverUploadY + 8}
            stroke="rgba(61,216,134,1)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <NetworkTooltip
            point={activePoint}
            x={tooltipX}
            y={tooltipY}
            width={tooltipWidth}
            height={tooltipHeight}
            isMobile={isMobile}
          />
        </>
      )}

      {chartPoints.map((_, index) => {
        const x = PADDING.left + index * stepX;
        const hitHeight = SVG_HEIGHT - PADDING.bottom - PADDING.top;

        return (
          <rect
            key={`hit-${index}`}
            x={x - Math.max(stepX / 2, 10)}
            y={PADDING.top}
            width={Math.max(stepX, 20)}
            height={hitHeight}
            fill="transparent"
            onMouseEnter={() => setHoveredIndex(index)}
          />
        );
      })}

      <g className="hidden sm:block">
        {Array.from({ length: DESKTOP_LABEL_COUNT }, (_, labelIndex) => {
          const x = getAxisLabelX(labelIndex, DESKTOP_LABEL_COUNT, innerWidth);

          return (
            <text
              key={`desktop-label-${labelIndex}`}
              x={x}
              y={SVG_HEIGHT - 12}
              textAnchor={
                labelIndex === 0 ? "start" : labelIndex === DESKTOP_LABEL_COUNT - 1 ? "end" : "middle"
              }
              fontSize="11"
              fill="rgba(255,255,255,0.5)"
            >
              {getAxisTimeLabel(startTimestamp, endTimestamp, labelIndex, DESKTOP_LABEL_COUNT)}
            </text>
          );
        })}
      </g>

      <g className="sm:hidden">
        {Array.from({ length: MOBILE_LABEL_COUNT }, (_, labelIndex) => {
          const x = getAxisLabelX(labelIndex, MOBILE_LABEL_COUNT, innerWidth);

          return (
            <text
              key={`mobile-label-${labelIndex}`}
              x={x}
              y={SVG_HEIGHT - 8}
              textAnchor={
                labelIndex === 0 ? "start" : labelIndex === MOBILE_LABEL_COUNT - 1 ? "end" : "middle"
              }
              fontSize={18}
              fontWeight="500"
              fill="rgba(255,255,255,0.52)"
            >
              {getAxisTimeLabel(startTimestamp, endTimestamp, labelIndex, MOBILE_LABEL_COUNT)}
            </text>
          );
        })}
      </g>
    </svg>
  );
}