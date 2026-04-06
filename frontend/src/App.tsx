import { NetworkWidget } from "./features/network-widget";
import SystemHeader from "./features/system-header/SystemHeader.tsx";

const App = () => {
  return (
    <main className="xl:flex space-y-3 gap-3 min-h-screen bg-zinc-950/95 px-3 py-3 sm:px-6 sm:py-6">
      <div className="sm:w-110">
        <SystemHeader/>
      </div>

      <div className="min-w-0">
        <NetworkWidget/>
      </div>
    </main>
  );
};

export default App;