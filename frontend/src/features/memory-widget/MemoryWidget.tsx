import {useEffect, useState} from "react";
import {MemoryStick} from "lucide-react";

import {WidgetHeader} from "../../common-ui/WidgetHeader/WidgetHeader.tsx"
import {MemoryPressureCard} from './components/MemoryPressureCard'
import {RamMemoryCard} from './components/RamMemoryCard'
import {SwapMemoryBar} from './components/SwapMemoryBar'
import {CachedMemoryBar} from './components/CachedMemoryBar'

import {Skeleton} from './MemoryWidgetSkeleton';
import {ErrorState} from './MemoryWidgetErrorPlaceholder'

import {getRoundedInstalledCapacityGB} from "./utils/usage.ts"
import {getDisplayedFrequencyMHz, getDisplayedMemoryType} from "./utils/hardware.ts"
import {getPressureAccent, getPressureLabel} from "./utils/status.ts"
import {fetchMemoryData} from './utils/fetch.ts'

import type {MemoryData} from './types'
import {POLL_MS} from "./constants"

export function MemoryWidget() {
  const [data, setData] = useState<MemoryData | null>(null);
  const [error, setError] = useState(false);

  const fetchData = () => fetchMemoryData(setData, setError);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, POLL_MS);
    return () => clearInterval(id);
  }, []);

  if (error) return <ErrorState onRetry={fetchData}/>;
  if (!data) return <Skeleton/>;

  const {raw, swap} = data;

  const pressure = raw.pressurePercentage;
  const color = getPressureAccent(pressure);
  const status = getPressureLabel(pressure);

  const memoryType = getDisplayedMemoryType(data);
  const frequencyMHz = getDisplayedFrequencyMHz(data);
  const memoryFrequency = frequencyMHz ? ` · ${frequencyMHz} MHz` : "";
  const memoryCapacity = getRoundedInstalledCapacityGB(data) + " GB";

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/6 bg-zinc-900 text-white shadow-lg sm:w-115">
      <WidgetHeader
        icon={MemoryStick}
        title="Memory Activity"
        label={`${memoryType} ${memoryFrequency} ${memoryCapacity}`}
        status={status}
        color={color}/>

      <div className="flex flex-col gap-3 px-2 py-2 sm:p-4">
        <div className="grid grid-cols-[1.5fr_1fr] gap-3">
          <MemoryPressureCard pressure={pressure} color={color}/>
          <RamMemoryCard raw={raw}/>
        </div>
        <SwapMemoryBar swap={swap}/>
        <CachedMemoryBar raw={raw}/>
      </div>
    </div>
  );
}