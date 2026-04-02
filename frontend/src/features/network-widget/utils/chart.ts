import { PADDING } from "../constants";

type Point = {
  x: number;
  y: number;
};

function getChartPoints(values: number[], maxValue: number, width: number, height: number): Point[] {
  const innerWidth = width - PADDING.left - PADDING.right;
  const innerHeight = height - PADDING.top - PADDING.bottom;
  const stepX = values.length > 1 ? innerWidth / (values.length - 1) : 0;
  const safeMaxValue = maxValue > 0 ? maxValue : 1;

  return values.map((value, index) => ({
    x: PADDING.left + index * stepX,
    y: PADDING.top + innerHeight - (value / safeMaxValue) * innerHeight,
  }));
}

function buildSmoothPath(points: Point[], tension = 0.8) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return d;
}

export function buildLinePath(values: number[], maxValue: number, width: number, height: number) {
  const points = getChartPoints(values, maxValue, width, height);
  return buildSmoothPath(points, 0.8);
}

export function buildAreaPath(values: number[], maxValue: number, width: number, height: number) {
  const points = getChartPoints(values, maxValue, width, height);
  if (points.length === 0) return "";

  const innerHeight = height - PADDING.top - PADDING.bottom;
  const baseY = PADDING.top + innerHeight;

  const first = points[0];
  const last = points[points.length - 1];
  const smoothLine = buildSmoothPath(points, 0.8);

  return `${smoothLine} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;
}

export function getAxisLabelX(step: number, totalSteps: number, innerWidth: number) {
  if (totalSteps <= 1) return PADDING.left;
  return PADDING.left + (innerWidth * step) / (totalSteps - 1);
}