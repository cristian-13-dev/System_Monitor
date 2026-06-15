export interface TitleProps {
  title: string
}

export const HeaderTitle = ({title}: TitleProps) => {
  return (
    <h2 className="text-[15px] font-medium text-white/92">{title}</h2>
  )
}