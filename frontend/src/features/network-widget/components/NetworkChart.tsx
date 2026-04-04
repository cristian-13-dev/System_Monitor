import {useMemo, useState} from "react";
import {
  Area,
  ComposedChart,
  Customized,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DESKTOP_LABEL_COUNT,
  MOBILE_LABEL_COUNT,
  DESKTOP_Y_TICKS,
  MOBILE_Y_TICKS,
} from "../constants";
import {formatAxisMbps, getAxisTimeLabel} from "../utils/format";
import type {ChartPoint} from "../types";
import NetworkTooltip from "./NetworkTooltip";

type Props = {
  chartPoints: ChartPoint[],
  maxValue: number,
  startTimestamp: number,
  endTimestamp: number,
  isMobile: boolean,
  innerWidth?: number
};

type ChartDatum = ChartPoint & {
  index: number;
};

type HoverOverlayProps = {
  hoveredIndex: number | null;
  chartPoints: ChartPoint[];
  isMobile: boolean;
  xAxisMap?: Record<string, unknown>;
  yAxisMap?: Record<string, unknown>;
  offset?: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
};

function HoverOverlay({
                        hoveredIndex,
                        chartPoints,
                        isMobile,
                        xAxisMap,
                        yAxisMap,
                        offset,
                      }: HoverOverlayProps) {
  const xAxis = xAxisMap
    ? (Object.values(xAxisMap)[0] as { scale: (v: number) => number })
    : null;

  const yAxis = yAxisMap
    ? (Object.values(yAxisMap)[0] as { scale: (v: number) => number })
    : null;

  if (!xAxis || !yAxis || !offset || hoveredIndex === null || !chartPoints[hoveredIndex]) {
    return null;
  }

  const activePoint = chartPoints[hoveredIndex];

  const hoverX = xAxis.scale(hoveredIndex);
  const hoverDownloadY = yAxis.scale(activePoint.download);
  const hoverUploadY = yAxis.scale(activePoint.upload);

  const viewLeft = offset.left;
  const viewTop = offset.top;
  const viewRight = offset.left + offset.width;
  const viewBottom = offset.top + offset.height;

  const tooltipWidth = 176;
  const tooltipHeight = 96;

  const tooltipX = Math.min(
    Math.max(hoverX - tooltipWidth / 2, viewLeft + 8),
    viewRight - tooltipWidth - 8
  );

  const tooltipY = Math.max(
    viewTop + 10,
    Math.min(
      Math.min(hoverDownloadY, hoverUploadY) - tooltipHeight - 14,
      viewBottom - tooltipHeight - 8
    )
  );

  return (
    <g pointerEvents="none">
      <line
        x1={hoverX}
        x2={hoverX}
        y1={viewTop}
        y2={viewBottom}
        stroke="rgba(255,255,255,0.16)"
      />

      <line
        x1={hoverX}
        x2={hoverX}
        y1={hoverDownloadY - 8}
        y2={hoverDownloadY + 8}
        stroke="rgba(110,135,255,1)"
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      <line
        x1={hoverX}
        x2={hoverX}
        y1={hoverUploadY - 8}
        y2={hoverUploadY + 8}
        stroke="rgba(61,216,134,1)"
        strokeWidth={2.5}
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
    </g>
  );
}

export function NetworkChart({
                               chartPoints,
                               maxValue,
                               startTimestamp,
                               endTimestamp,
                               isMobile,
                             }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const safeMaxValue = maxValue > 0 ? maxValue : 1;
  const axisFontSize = isMobile ? 12 : 11;
  const labelCount = isMobile ? MOBILE_LABEL_COUNT : DESKTOP_LABEL_COUNT;

  const data = useMemo<ChartDatum[]>(
    () => chartPoints.map((point, index) => ({...point, index})),
    [chartPoints]
  );

  const xTicks = useMemo(() => {
    if (data.length <= 1 || labelCount <= 1) return [0];

    return Array.from({length: labelCount}, (_, labelIndex) => {
      return ((data.length - 1) * labelIndex) / (labelCount - 1);
    });
  }, [data.length, labelCount]);

  const xTickIndexMap = useMemo(() => {
    return new Map(xTicks.map((value, index) => [value.toFixed(6), index]));
  }, [xTicks]);

  const yTicks = isMobile ? MOBILE_Y_TICKS : DESKTOP_Y_TICKS;

  const chartMargin = {
    top: 4,
    right: isMobile ? 10 : 16,
    bottom: isMobile ? 18 : 10,
    left: isMobile ? 10 : 16,
  };

  return (
    <div className="relative h-55 w-full sm:h-85">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={chartMargin}
          onMouseMove={(state) => {
            const s = state as {
              isTooltipActive?: boolean;
              activeTooltipIndex?: number | null;
            };

            if (s?.isTooltipActive && typeof s.activeTooltipIndex === "number") {
              setHoveredIndex(s.activeTooltipIndex);
              return;
            }

            setHoveredIndex(null);
          }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="downloadArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ADE80" stopOpacity={0.28}/>
              <stop offset="65%" stopColor="#4ADE80" stopOpacity={0.1}/>
              <stop offset="100%" stopColor="#4ADE80" stopOpacity={0.01}/>
            </linearGradient>

            <linearGradient id="uploadArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#667EFF" stopOpacity={0.2}/>
              <stop offset="65%" stopColor="#667EFF" stopOpacity={0.08}/>
              <stop offset="100%" stopColor="#667EFF" stopOpacity={0.01}/>
            </linearGradient>
          </defs>

          <XAxis
            type="number"
            dataKey="index"
            domain={[0, Math.max(data.length - 1, 0)]}
            ticks={xTicks}
            tickLine={false}
            axisLine={false}
            interval={0}
            allowDecimals
            tick={({x, y, payload}) => {
              const xNum = Number(x);
              const yNum = Number(y);
              const labelIndex =
                xTickIndexMap.get(Number(payload.value).toFixed(6)) ?? 0;

              return (
                <text
                  x={xNum}
                  y={yNum + 14}
                  textAnchor={
                    labelIndex === 0
                      ? "start"
                      : labelIndex === labelCount - 1
                        ? "end"
                        : "middle"
                  }
                  fontSize={axisFontSize}
                  fontWeight={isMobile ? 500 : undefined}
                  fill="rgba(255,255,255,0.52)"
                >
                  {getAxisTimeLabel(
                    startTimestamp,
                    endTimestamp,
                    labelIndex,
                    labelCount
                  )}
                </text>
              );
            }}
          />

          <YAxis
            type="number"
            domain={[0, safeMaxValue]}
            ticks={yTicks.map((tick) => safeMaxValue * tick)}
            tickLine={false}
            axisLine={false}
            width={0}
            allowDecimals={false}
            tick={false}
          />

          {yTicks.map((tick, index) => (
            <ReferenceLine
              key={`y-${index}`}
              y={safeMaxValue * tick}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="4 7"
              strokeWidth={isMobile ? 1.5 : 1}
            />
          ))}

          {data.map((point) => (
            <ReferenceLine
              key={`x-${point.index}`}
              x={point.index}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={isMobile ? 1.5 : 1}
            />
          ))}

          <Area
            type="monotoneX"
            dataKey="upload"
            stroke="none"
            fill="url(#uploadArea)"
            isAnimationActive={false}
          />

          <Area
            type="monotoneX"
            dataKey="download"
            stroke="none"
            fill="url(#downloadArea)"
            isAnimationActive={false}
          />

          <Line
            type="monotoneX"
            dataKey="download"
            stroke="rgba(61,216,134,0.96)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />

          <Line
            type="monotoneX"
            dataKey="upload"
            stroke="rgba(110,135,255,0.98)"
            strokeWidth={2.5}
            strokeDasharray={isMobile ? "12 10" : "10 8"}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />

          <Tooltip
            cursor={false}
            isAnimationActive={false}
            allowEscapeViewBox={{x: true, y: true}}
            wrapperStyle={{
              pointerEvents: "none",
              outline: "none",
              zIndex: 30,
            }}
            content={(props) => (
              <NetworkTooltip {...(props)} isMobile={isMobile}/>
            )}
          />

          <Customized
            component={
              <HoverOverlay
                hoveredIndex={hoveredIndex}
                chartPoints={chartPoints}
                isMobile={isMobile}
              />
            }
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div
        className="pointer-events-none absolute"
        style={{
          top: chartMargin.top,
          left: chartMargin.left,
          right: chartMargin.right,
          bottom: chartMargin.bottom,
        }}
      >
        {yTicks.map((tick, idx) => {
          const isTop = idx === yTicks.length - 1;
          const isBottom = idx === 0;

          return (
            <div
              key={`y-label-${idx}`}
              className="absolute left-2"
              style={{
                top: `${(1 - tick) * 100}%`,
                transform: isTop
                  ? "translateY(0%)"
                  : isBottom
                    ? "translateY(-100%)"
                    : "translateY(-50%)",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: isMobile ? 20 : 18,
                  padding: isMobile ? "0 7px" : "0 6px",
                  fontSize: isMobile ? 12 : 11,
                  lineHeight: 1,
                  color: "rgba(255,255,255,0.68)",
                  whiteSpace: "nowrap",
                  borderRadius: 6,
                  background: "bg-zinc-900",
                  backdropFilter: "blur(100px)",
                }}
              >
                {formatAxisMbps(Number(safeMaxValue * tick))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}