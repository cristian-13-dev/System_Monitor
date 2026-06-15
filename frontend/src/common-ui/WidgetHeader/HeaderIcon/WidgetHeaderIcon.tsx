import type {LucideIcon} from "lucide-react"
import {IconContainer} from "./IconContainer"

interface WidgetHeaderIconProps {
  Icon: LucideIcon
  size?: number
}

export const WidgetHeaderIcon = ({Icon, size = 21}: WidgetHeaderIconProps) => {
  return (
    <IconContainer>
      <Icon size={size}/>
    </IconContainer>
  )
}