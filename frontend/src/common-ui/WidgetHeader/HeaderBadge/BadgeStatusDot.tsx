interface BadgeStatusDotProps {
  color?: string;
}

export const BadgeStatusDot = ({color}: BadgeStatusDotProps) => {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full"
      style={{
        backgroundColor: color,
        boxShadow: `0 0 6px ${color}`,
        animation: "pulse 2.5s ease-in-out infinite"
      }}
    />
  )
}