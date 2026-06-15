export const Skeleton = () => {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/6 bg-zinc-900 animate-pulse sm:w-115">
      <div className="flex items-center gap-3 border-b border-white/6 px-5 py-4">
        <div className="h-11 w-11 shrink-0 rounded-xl bg-white/2.5"/>
        <div className="flex-1">
          <div className="h-4 w-36 rounded bg-white/8"/>
          <div className="mt-2 h-3 w-28 rounded bg-white/5"/>
        </div>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="grid grid-cols-[1.5fr_1fr] gap-3">
          <div className="h-49 rounded-xl bg-white/2.5"/>
          <div className="h-49 rounded-xl bg-white/2.5"/>
        </div>
        <div className="h-18 rounded-xl bg-white/2.5"/>
        <div className="h-18 rounded-xl bg-white/2.5"/>
      </div>
    </div>
  );
}