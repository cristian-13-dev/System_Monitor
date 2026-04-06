import {NetworkWidget} from "./features/network-widget";
import CpuWidget from "./features/cpu-widget/components/CpuWidget.tsx";
import "./App.css";

const App = () => {
  return (
    <main className="xl:flex space-y-3 gap-3 min-h-screen px-3 py-3 sm:px-6 sm:py-6">
      <CpuWidget/>
      <NetworkWidget/>
    </main>
  );
};

export default App;