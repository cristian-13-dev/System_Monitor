import {Pie, PieChart, ResponsiveContainer} from "recharts";
import {COLOR, GAUGE_STYLE} from "../../constants.ts";
import type {HashString} from "../../types";
import {useMemo} from "react";

interface GaugeChartProps {
  data: { value: number }[];
  color: HashString;
}

export const GaugeChart = ({data, color}: GaugeChartProps) => {
  const usage = data[0]?.value ?? 0;

  const chartData = useMemo(() => [
    {value: usage, fill: color},
    {value: 100 - usage, fill: COLOR.track},
  ], [usage, color]);

  return (
    <div className="absolute left-1/2 top-1/2" style={GAUGE_STYLE}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            startAngle={180}
            endAngle={0}
            cx="50%"
            cy="71%"
            innerRadius="72%"
            outerRadius="96%"
            cornerRadius={8}
            stroke="none"
            animationBegin={100}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};