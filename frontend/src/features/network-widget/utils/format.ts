export function formatSpeed(value: number) {
  if (!Number.isFinite(value)) return "--";
  if (value >= 100) return `${value.toFixed(0)} Mbps`;
  if (value >= 10) return `${value.toFixed(1)} Mbps`;
  return `${value.toFixed(2)} Mbps`;
}

export function formatDelay(value: number) {
  if (!Number.isFinite(value)) return "-- ms";
  return `${Math.round(value)} ms`;
}

export function formatAxisMbps(value: number) {
  return `${Math.round(value)} Mbps`;
}

export function formatTickLabel(timestamp: number) {
  if (!timestamp) return "--:--:--";

  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function getAxisTimeLabel(
  startTimestamp: number,
  endTimestamp: number,
  step: number,
  totalSteps: number
) {
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