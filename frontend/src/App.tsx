import { useState } from "react";
import { NetworkWidget } from "./features/network-widget";
import CpuWidget from "./features/cpu-widget/components/CpuWidget.tsx";
import {MemoryWidget} from "./features/memory-widget/MemoryWidget.tsx";
import "./App.css";

const App = () => {
  const [appError, setAppError] = useState<string | null>(null);

  return (
    <main className="xl:flex space-y-3 gap-3 min-h-screen px-3 py-3 sm:px-6 sm:py-6">
      <div className="w-full space-y-3">
        {appError && (
          <div className="rounded-[18px] border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200 whitespace-pre-wrap wrap-break-word">
            <div className="font-semibold mb-1">Application error</div>
            <div>{appError}</div>
          </div>
        )}

        <div className="xl:flex space-y-3 xl:space-y-0 gap-3">
          <CpuWidget onError={setAppError} />
          <MemoryWidget />
          <NetworkWidget />
        </div>
      </div>
    </main>
  );
};

export default App;