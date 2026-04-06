export function fmtFreq(value: number | null | undefined): string {
  if (value == null) return "N/A";
  if (value < 1) return `${(value * 1000).toFixed(0)} MHz`;
  return `${value.toFixed(2)} GHz`;
}

export function fmtTemp(value: number | null | undefined): string {
  if (value == null) return "N/A";
  return `${value.toFixed(0)}°C`;
}