export const formatToMbps = (value: number): number => {
  return Number(((value * 8) / 1_000_000).toFixed(2));
};