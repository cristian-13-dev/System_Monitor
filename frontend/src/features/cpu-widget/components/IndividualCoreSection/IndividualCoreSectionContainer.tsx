import type {ReactNode} from "react";

interface IndividualCoreSectionProps {
  coreCount: number;
  children?: ReactNode;
}

export const IndividualCoreSectionContainer = ({coreCount, children}: IndividualCoreSectionProps) => {
  const cols = Math.ceil(Math.sqrt(coreCount));
  const gridCols = `repeat(${cols || 1}, minmax(0, 1fr))`;

  return <div className="grid gap-1.5" style={{gridTemplateColumns: gridCols}}>
    {children}
  </div>
}