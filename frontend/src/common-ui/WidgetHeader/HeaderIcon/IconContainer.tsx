import type {ReactNode} from 'react';

export const IconContainer = ({children}: {children: ReactNode}) => {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-white/85">
      {children}
    </div>
  )
}