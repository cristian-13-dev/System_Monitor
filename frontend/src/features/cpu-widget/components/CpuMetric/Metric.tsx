import type {ElementType} from "react";

interface MetricProps {
  icon: ElementType;
  value: string;
  tone?: string;
  align?: "left" | "right";
}

export const Metric = ({icon: Icon, value, tone, align = "left"}: MetricProps) => {
  return (
    <div className={`flex items-center gap-2 ${align === "right" ? "ml-auto" : ""}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" style={{color: tone ?? "#52525b"}}/>
      <span className="tabular-nums text-[13px] font-medium text-zinc-300">{value}</span>
    </div>
  );
}