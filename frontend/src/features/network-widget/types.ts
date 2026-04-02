export type NetworkPoint = {
  timestamp: number;
  download: number;
  upload: number;
  delay: number;
};

export type ChartPoint = NetworkPoint & {
  index: number;
};

export type BandwidthStatus = {
  label: string;
  toneClass: string;
};

export type Padding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};