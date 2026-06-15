import {BadgeContainer} from "./BadgeContainer";
import {BadgeStatusDot} from "./BadgeStatusDot";
import {BadgeStatus} from "./BadgeStatus";

export interface HeaderWidgetBadgeProps {
  status: string;
  color?: string;
}

export const HeaderWidgetBadge = ({status, color}: HeaderWidgetBadgeProps) => {
  return (
    <BadgeContainer color={color}>
      <BadgeStatusDot color={color}/>
      <BadgeStatus status={status} color={color}/>
    </BadgeContainer>
  )
}