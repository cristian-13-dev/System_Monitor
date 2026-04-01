import {useEffect, useMemo, useState} from "react";
import {ArrowDownRight, ArrowUpRight, Gauge, TimerReset, Wifi} from "lucide-react";

const API_URL = "http://100.93.206.41:3001/api/metrics";
const MAX_POINTS = 16;
const SVG_WIDTH = 640;
const SVG_HEIGHT = 320;
const PADDING = {top: 12, right: 18, bottom: 28, left: 22};

type NetworkPoint = {
  timestamp: number;
  download: number;
  upload: number;
  delay: number;
};

function formatSpeed(value: number) {
  if (!Number.isFinite(value)) return "--";
  if (value >= 100) return `${value.toFixed(0)} Mbps`;
  if (value >= 10) return `${value.toFixed(1)} Mbps`;
  return `${value.toFixed(2)} Mbps`;
}

function formatDelay(value: number) {
  if (!Number.isFinite(value)) return "-- ms";
  return `${Math.round(value)} ms`;
}

function formatAxisMbps(value: number) {
  return `${Math.round(value)} Mbps`;
}

function formatTickLabel(timestamp: number) {
  if (!timestamp) return "--:--:--";
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function getAxisTimeLabel(startTimestamp: number, endTimestamp: number, step: number, totalSteps: number) {
  if (!startTimestamp || !endTimestamp || totalSteps <= 1) return "--:--:--";

  const interpolated =
    startTimestamp + ((endTimestamp - startTimestamp) * step) / (totalSteps - 1);

  return new Date(interpolated).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function getMetric(payload: any): NetworkPoint {
  const network = payload?.network?.interfaces?.[0] ?? {};
  const timestamp = payload?.network?.updatedAt ?? payload?.system?.updatedAt ?? Date.now();

  return {
    timestamp: new Date(timestamp).getTime(),
    download: Number(network.downloadMbps ?? 0),
    upload: Number(network.uploadMbps ?? 0),
    delay: Number(network.latencyMs ?? 0),
  };
}

function buildLinePath(values: number[], maxValue: number, width: number, height: number) {
  const innerWidth = width - PADDING.left - PADDING.right;
  const innerHeight = height - PADDING.top - PADDING.bottom;
  const stepX = values.length > 1 ? innerWidth / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const x = PADDING.left + index * stepX;
      const y = PADDING.top + innerHeight - (value / maxValue) * innerHeight;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

function buildAreaPath(values: number[], maxValue: number, width: number, height: number) {
  const innerWidth = width - PADDING.left - PADDING.right;
  const innerHeight = height - PADDING.top - PADDING.bottom;
  const stepX = values.length > 1 ? innerWidth / (values.length - 1) : 0;
  const baseY = PADDING.top + innerHeight;

  const line = values
    .map((value, index) => {
      const x = PADDING.left + index * stepX;
      const y = PADDING.top + innerHeight - (value / maxValue) * innerHeight;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return `${line} L${PADDING.left + innerWidth},${baseY} L${PADDING.left},${baseY} Z`;
}

function getBandwidthStatus(download: number, upload: number) {
  const combined = download + upload;

  if (combined >= 120) {
    return {
      label: "Very High",
      toneClass: "text-red-300",
      iconTone: "text-red-300",
    };
  }

  if (combined >= 80) {
    return {
      label: "High",
      toneClass: "text-amber-400",
      iconTone: "text-amber-400",
    };
  }

  return {
    label: "Low",
    toneClass: "text-[#3dd886]",
    iconTone: "text-[#3dd886]",
  };
}

function getAxisLabelX(step: number, totalSteps: number, innerWidth: number) {
  if (totalSteps <= 1) return PADDING.left;
  return PADDING.left + (innerWidth * step) / (totalSteps - 1);
}

export default function NetworkWidget() {
  const [points, setPoints] = useState<NetworkPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const updateIsMobile = () => setIsMobile(media.matches);

    updateIsMobile();
    media.addEventListener("change", updateIsMobile);

    return () => {
      media.removeEventListener("change", updateIsMobile);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchMetrics = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);

        const payload = await response.json();
        const metric = getMetric(payload);

        if (!mounted) return;

        setPoints((prev) => [...prev, metric].slice(-MAX_POINTS));
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load metrics");
      }
    };

    fetchMetrics();
    const interval = window.setInterval(fetchMetrics, 2000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const chartPoints = useMemo(() => {
    if (!points.length) {
      return Array.from({length: MAX_POINTS}, (_, index) => ({
        timestamp: 0,
        download: 0,
        upload: 0,
        delay: 0,
        index,
      }));
    }

    const padded = [...points];
    while (padded.length < MAX_POINTS) {
      padded.unshift({timestamp: 0, download: 0, upload: 0, delay: 0});
    }

    return padded.map((point, index) => ({...point, index}));
  }, [points]);

  const latest = chartPoints[chartPoints.length - 1];
  const activeIndex = hoveredIndex ?? chartPoints.length - 1;
  const activePoint = chartPoints[activeIndex];
  const isHovering = hoveredIndex !== null;
  const bandwidthStatus = getBandwidthStatus(latest.download, latest.upload);

  const maxValue = useMemo(() => {
    const values = chartPoints.flatMap((point) => [point.download, point.upload]);
    return Math.max(2, ...values, 10);
  }, [chartPoints]);

  const avgDownload = useMemo(() => {
    if (!points.length) return 0;
    return points.reduce((sum, point) => sum + point.download, 0) / points.length;
  }, [points]);

  const avgUpload = useMemo(() => {
    if (!points.length) return 0;
    return points.reduce((sum, point) => sum + point.upload, 0) / points.length;
  }, [points]);

  const avgDelay = useMemo(() => {
    if (!points.length) return 0;
    return points.reduce((sum, point) => sum + point.delay, 0) / points.length;
  }, [points]);

  const innerWidth = SVG_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = SVG_HEIGHT - PADDING.top - PADDING.bottom;
  const stepX = chartPoints.length > 1 ? innerWidth / (chartPoints.length - 1) : 0;

  const downloadValues = chartPoints.map((point) => point.download);
  const uploadValues = chartPoints.map((point) => point.upload);

  const downloadLine = buildLinePath(downloadValues, maxValue, SVG_WIDTH, SVG_HEIGHT);
  const downloadArea = buildAreaPath(downloadValues, maxValue, SVG_WIDTH, SVG_HEIGHT);
  const uploadLine = buildLinePath(uploadValues, maxValue, SVG_WIDTH, SVG_HEIGHT);
  const uploadArea = buildAreaPath(uploadValues, maxValue, SVG_WIDTH, SVG_HEIGHT);

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

  const yTicks = [0.2, 0.4, 0.6, 0.8, 1];
  const axisFontSize = isMobile ? 18 : 11;
  const axisFontFill = isMobile ? "rgba(255,255,255,0.52)" : "rgba(255,255,255,0.52)";
  const desktopLabelCount = 7;
  const mobileLabelCount = 4;

  const firstRealPoint = chartPoints.find((point) => point.timestamp);
  const startTimestamp = firstRealPoint?.timestamp ?? 0;
  const endTimestamp = latest.timestamp ?? 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950/95 p-2 text-white sm:p-6">
      <div
        className="w-full max-w-180 overflow-hidden rounded-[18px] border border-white/6 bg-zinc-900 shadow-[0_18px_50px_rgba(0,0,0,0.42)]">
        <div
          className="flex flex-col gap-3 border-b border-white/6 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-white/85 sm:h-11 sm:w-11">
              <Wifi size={21}/>
            </div>
            <div>
              <div className="text-[15px] font-medium text-white/92">Network activity</div>
              <div className="mt-0.5 text-xs text-white/46">
                Real-time download, upload and latency data
              </div>
            </div>
          </div>

          <div
            className="inline-flex items-center gap-2 self-start rounded-[10px] border border-white/8 bg-white/3 px-3 py-1.5 text-sm text-white/72 sm:self-auto">
            <Gauge size={14} className={bandwidthStatus.iconTone}/>
            <span>Bandwidth</span>
            <span className={`font-medium ${bandwidthStatus.toneClass}`}>{bandwidthStatus.label}</span>
          </div>
        </div>

        <div className="px-2 pt-2 sm:px-4 sm:pt-4">
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className="h-55 w-full sm:h-85"
            fill="none"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              <linearGradient id="downloadArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(102,126,255,0.28)"/>
                <stop offset="65%" stopColor="rgba(102,126,255,0.10)"/>
                <stop offset="100%" stopColor="rgba(102,126,255,0.01)"/>
              </linearGradient>
              <linearGradient id="uploadArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(74,222,128,0.20)"/>
                <stop offset="65%" stopColor="rgba(74,222,128,0.08)"/>
                <stop offset="100%" stopColor="rgba(74,222,128,0.01)"/>
              </linearGradient>
            </defs>

            {yTicks.map((tick, index) => {
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
                  <text x={0} y={y + 4} fontSize={axisFontSize} fill={axisFontFill}>
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

            <path d={downloadArea} fill="url(#downloadArea)"/>
            <path d={uploadArea} fill="url(#uploadArea)"/>

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

                <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                  <rect
                    width={tooltipWidth}
                    height={tooltipHeight}
                    rx="12"
                    fill="rgba(18,20,27,0.52)"
                    stroke="rgba(255,255,255,0.08)"
                  />
                  <path
                    d={`M0,12 Q0,0 12,0 L${tooltipWidth - 12},0 Q${tooltipWidth},0 ${tooltipWidth},12 L${tooltipWidth},28 L0,28 Z`}
                    fill="rgba(255,255,255,0.045)"
                  />
                  <text x="12" y="18" fontSize={isMobile ? 13 : 11} fontWeight="700" fill="rgba(255,255,255,0.96)">
                    {activePoint.timestamp ? formatTickLabel(activePoint.timestamp) : "Waiting for data"}
                  </text>

                  <line x1="14" x2="14" y1="40" y2="52" stroke="rgba(110,135,255,1)" strokeWidth="2.5"
                        strokeLinecap="round"/>
                  <text x="24" y="49" fontSize={isMobile ? 13 : 11} fill="rgba(255,255,255,0.72)">
                    Download
                  </text>
                  <text x={tooltipWidth - 12} y="49" textAnchor="end" fontSize={isMobile ? 13 : 11}
                        fill="rgba(255,255,255,0.52)">
                    {formatSpeed(activePoint.download)}
                  </text>

                  <line x1="14" x2="14" y1="59" y2="71" stroke="rgba(61,216,134,1)" strokeWidth="2.5"
                        strokeLinecap="round"/>
                  <text x="24" y="68" fontSize={isMobile ? 13 : 11} fill="rgba(255,255,255,0.72)">
                    Upload
                  </text>
                  <text x={tooltipWidth - 12} y="68" textAnchor="end" fontSize={isMobile ? 13 : 11}
                        fill="rgba(255,255,255,0.52)">
                    {formatSpeed(activePoint.upload)}
                  </text>

                  <line x1="14" x2="14" y1="78" y2="90" stroke="rgba(251,191,36,0.95)" strokeWidth="2.5"
                        strokeLinecap="round"/>
                  <text x="24" y="87" fontSize={isMobile ? 13 : 11} fill="rgba(255,255,255,0.72)">
                    Delay
                  </text>
                  <text x={tooltipWidth - 12} y="87" textAnchor="end" fontSize={isMobile ? 13 : 11}
                        fill="rgba(255,255,255,0.52)">
                    {formatDelay(activePoint.delay)}
                  </text>
                </g>
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
              {Array.from({length: desktopLabelCount}, (_, labelIndex) => {
                const x = getAxisLabelX(labelIndex, desktopLabelCount, innerWidth);
                return (
                  <text
                    key={`desktop-label-${labelIndex}`}
                    x={x}
                    y={SVG_HEIGHT - 12}
                    textAnchor={labelIndex === 0 ? "start" : labelIndex === desktopLabelCount - 1 ? "end" : "middle"}
                    fontSize="11"
                    fill="rgba(255,255,255,0.5)"
                  >
                    {getAxisTimeLabel(startTimestamp, endTimestamp, labelIndex, desktopLabelCount)}
                  </text>
                );
              })}
            </g>

            <g className="sm:hidden">
              {Array.from({length: mobileLabelCount}, (_, labelIndex) => {
                const x = getAxisLabelX(labelIndex, mobileLabelCount, innerWidth);
                return (
                  <text
                    key={`mobile-label-${labelIndex}`}
                    x={x}
                    y={SVG_HEIGHT - 8}
                    textAnchor={labelIndex === 0 ? "start" : labelIndex === mobileLabelCount - 1 ? "end" : "middle"}
                    fontSize={18}
                    fontWeight="500"
                    fill="rgba(255,255,255,0.52)"
                  >
                    {getAxisTimeLabel(startTimestamp, endTimestamp, labelIndex, mobileLabelCount)}
                  </text>
                );
              })}
            </g>
          </svg>
        </div>

        <div
          className="grid grid-cols-3 gap-2.5 border-t border-white/6 px-2 pb-2 pt-2 sm:gap-3 sm:px-4 sm:pb-4 sm:pt-3">
          <div className="rounded-2xl border border-white/7 bg-white/2.5 px-2.5 py-2 sm:px-3 sm:py-2.5">
            <div
              className="flex flex-col gap-1 text-[11px] uppercase font-semibold tracking-[0.12em] text-white/40 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="flex items-center gap-2">
                <ArrowDownRight size={13} className="text-[#6e87ff]"/>
                Download
              </div>
              <div className="text-[13px] font-semibold normal-case tracking-normal text-white/94">
                {formatSpeed(latest.download)}
              </div>
            </div>
            <div className="mt-1 hidden text-[12px] text-white/42 sm:block">Average {formatSpeed(avgDownload)}</div>
          </div>

          <div className="rounded-2xl border border-white/7 bg-white/2.5 px-2.5 py-2 sm:px-3 sm:py-2.5">
            <div
              className="flex flex-col gap-1 text-[11px] uppercase font-semibold tracking-[0.12em] text-white/40 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="flex items-center gap-2">
                <ArrowUpRight size={13} className="text-[#3dd886]"/>
                Upload
              </div>
              <div className="text-[13px] font-semibold normal-case tracking-normal text-white/94">
                {formatSpeed(latest.upload)}
              </div>
            </div>
            <div className="mt-1 hidden text-[12px] text-white/42 sm:block">Average {formatSpeed(avgUpload)}</div>
          </div>

          <div className="rounded-2xl border border-white/7 bg-white/2.5 px-2.5 py-2 sm:px-3 sm:py-2.5">
            <div
              className="flex flex-col gap-1 text-[11px] uppercase tracking-[0.12em] font-semibold text-white/40 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="flex items-center gap-2">
                <TimerReset size={13} className="text-amber-400"/>
                Latency
              </div>
              <div className="text-[13px] font-semibold normal-case tracking-normal text-white/94">
                {formatDelay(avgDelay)}
              </div>
            </div>
            <div className="mt-1 hidden text-[12px] text-white/42 sm:block">Average response</div>
          </div>
        </div>

        {error && <div className="border-t border-white/6 px-5 py-3 text-sm text-white/42">{error}</div>}
      </div>
    </div>
  );
}
