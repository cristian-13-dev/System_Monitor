import type {HeaderWidgetBadgeProps} from "./HeaderWidgetBadge";

export const BadgeStatus = ({status, color}: HeaderWidgetBadgeProps) => {
  return (
    <span className="text-[12px] font-medium" style={{color: color}}>
        {status}
      </span>
  )
}