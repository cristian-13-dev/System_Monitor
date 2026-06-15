export interface LabelProps {
  label: string
}

export const HeaderLabel = ({label}: LabelProps) => {
  return (
    <p className="mt-0.5 text-xs text-white/46">{label}</p>
  )
}