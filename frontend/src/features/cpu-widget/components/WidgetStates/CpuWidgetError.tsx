type CpuWidgetErrorProps = {
  message: string;
};

export function CpuWidgetError({ message }: CpuWidgetErrorProps) {
  return (
    <section className="w-full max-w-130">
      <div className="overflow-hidden rounded-[18px] border border-white/6 bg-zinc-900 px-5 py-8 text-center text-sm text-white/40">
        {message}
      </div>
    </section>
  );
}