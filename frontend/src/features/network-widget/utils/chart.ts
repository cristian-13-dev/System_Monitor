import { PADDING } from "../constants";

export function buildLinePath(values: number[], maxValue: number, width: number, height: number) {
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

export function buildAreaPath(values: number[], maxValue: number, width: number, height: number) {
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

export function getAxisLabelX(step: number, totalSteps: number, innerWidth: number) {
  if (totalSteps <= 1) return PADDING.left;
  return PADDING.left + (innerWidth * step) / (totalSteps - 1);
}