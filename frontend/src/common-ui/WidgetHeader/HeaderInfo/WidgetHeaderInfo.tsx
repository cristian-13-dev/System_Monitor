import type {ReactNode} from "react";

interface HeaderInfoProps {
  children?: ReactNode
}

export const WidgetHeaderInfo = ({children}: HeaderInfoProps) => {
  return (
    <div>{children}</div>
  )
}