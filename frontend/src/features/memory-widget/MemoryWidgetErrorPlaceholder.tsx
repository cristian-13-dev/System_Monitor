import {RefreshCw} from 'lucide-react'

interface ErrorPlaceholderProps {
  onRetry: () => void
}

export const ErrorState = ({onRetry}: ErrorPlaceholderProps)=> {
  return (
    <div
      className="flex w-full flex-col items-center gap-3 rounded-xl border border-white/6 bg-zinc-900 px-5 py-8 text-white sm:w-115">
      <p className="text-sm text-white/50">Failed to load memory data</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 text-xs text-white/60 transition-colors hover:text-white/90"
      >
        <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.8}/>
        Retry
      </button>
    </div>
  );
}