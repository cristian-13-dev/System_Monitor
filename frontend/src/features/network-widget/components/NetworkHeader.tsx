import {Wifi} from "lucide-react";
import type { BandwidthStatus } from "../types";
import {WidgetHeader} from "../../../common-ui/WidgetHeader/WidgetHeader.tsx";

type Props = {
  bandwidthStatus: BandwidthStatus;
};

export function NetworkHeader({ bandwidthStatus }: Props) {
  const color = bandwidthStatus.tone;
  const {label: status} = bandwidthStatus;

  return (
    <WidgetHeader
      icon={Wifi}
      title="Network Activity"
      label="Download, upload and latency data"
      status={status}
      color={color}/>
  );
}