import {WidgetHeaderIcon} from "./HeaderIcon/WidgetHeaderIcon.tsx";
import {WidgetHeaderInfo} from "./HeaderInfo/WidgetHeaderInfo.tsx";
import {HeaderTitle} from "./HeaderInfo/HeaderTitle.tsx";
import {HeaderLabel} from "./HeaderInfo/HeaderLabel.tsx";
import {HeaderWidgetBadge} from "./HeaderBadge/HeaderWidgetBadge";

import type {LucideIcon} from "lucide-react";

interface WidgetHeaderProps {
  icon: LucideIcon
  title: string
  label: string
  status: string
  color: string
}

export const WidgetHeader = ({icon, title, label, status, color}: WidgetHeaderProps) => {
  return <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3 sm:px-5 sm:py-4">
    <div className="flex items-center gap-3">
      <WidgetHeaderIcon Icon={icon}/>

      <WidgetHeaderInfo>
        <HeaderTitle title={title}/>
        <HeaderLabel label={label}/>
      </WidgetHeaderInfo>
    </div>

    <HeaderWidgetBadge status={status} color={color}/>
  </div>
}