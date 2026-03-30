export const formatToGb = (value: number): number => {
  return Number((value / 1024 / 1024 / 1000).toFixed(2))
}