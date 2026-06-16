import {useEffect, useMemo} from "react";

import {useCpuMetrics} from "../../hooks/useCpuMetrics";
import {getTone} from "../../utils/tone";

import {CpuWidgetLoading} from "../WidgetStates/CpuWidgetLoading";
import {CpuWidgetError} from "../WidgetStates/CpuWidgetError";
import {CpuWidgetCard} from "./CpuWidgetCard";
import {getErrorMessage} from "../../utils/error";

type CpuWidgetProps = {
  onError: (message: string | null) => void;
};

export default function CpuWidget({onError}: CpuWidgetProps) {
  const {cpu, history, error} = useCpuMetrics();

  useEffect(() => {
    if (!onError) return;
    onError(error ? getErrorMessage(error) : null);
  }, [error, onError]);

  const color = useMemo(() => {
    return cpu ? getTone(cpu.averageCpuUtilization) : getTone(0);
  }, [cpu]);

  if (error) return <CpuWidgetError message={getErrorMessage(error)}/>;
  if (!cpu) return <CpuWidgetLoading/>;

  return <CpuWidgetCard cpu={cpu} history={history} color={color}/>;
}