import type {ReactNode} from 'react';

interface BadgeContainerProps {
  children?: ReactNode;
  color?: string;
}

export const BadgeContainer = ({children, color}: BadgeContainerProps) => {
  return (
    <div
      className="flex items-center gap-2 rounded-lg border px-3 py-1.5"
      style={{borderColor: `${color}28`, background: `${color}0f`}}
    >
      {children}
    </div>
  )
}