import { useMemo } from "react";
import { MAX_POINTS, PADDING, SVG_HEIGHT, SVG_WIDTH } from "../constants";
import { buildAreaPath, buildLinePath } from "../utils/chart";
import { getBandwidthStatus } from "../utils/status";
import type { ChartPoint, NetworkPoint } from "../types";

export function useNetworkChart(points: NetworkPoint[]) {
  const chartPoints = useMemo<ChartPoint[]>(() => {
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
  const uploadLine = buildLinePath(uploadValues, maxValue, SVG_WIDTH, SVG_HEIGHT);
  const downloadArea = buildAreaPath(downloadValues, maxValue, SVG_WIDTH, SVG_HEIGHT);
  const uploadArea = buildAreaPath(uploadValues, maxValue, SVG_WIDTH, SVG_HEIGHT);

  const firstRealPoint = chartPoints.find((point) => point.timestamp);
  const startTimestamp = firstRealPoint?.timestamp ?? 0;
  const endTimestamp = latest.timestamp ?? 0;

  const bandwidthStatus = getBandwidthStatus(latest.download, latest.upload);

  return {
    chartPoints,
    latest,
    maxValue,
    avgDownload,
    avgUpload,
    avgDelay,
    innerWidth,
    innerHeight,
    stepX,
    downloadLine,
    uploadLine,
    downloadArea,
    uploadArea,
    startTimestamp,
    endTimestamp,
    bandwidthStatus,
  };
}