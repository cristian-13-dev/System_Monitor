import { NetworkWidget } from "./features/network-widget";
import SystemHeader from "./features/system-header/SystemHeader.tsx";

const App = () => {
  return (
    <main className="min-h-screen bg-zinc-950/95 px-3 py-3 sm:px-6 sm:py-6">
      <div className="mx-auto">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
          <div className="min-w-0">
            <SystemHeader />
          </div>

          <div className="min-w-0">
            <NetworkWidget />
          </div>
        </div>
      </div>
    </main>
  );
};

export default App;