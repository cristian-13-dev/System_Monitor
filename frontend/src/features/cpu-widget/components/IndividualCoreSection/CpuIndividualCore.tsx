import {Header} from './Header';
import {IndividualCoreSectionContainer} from './IndividualCoreSectionContainer';
import {Core} from './Core';

import type {CpuMetrics} from "../../types.ts";

export type CpuIndividualCoreProps = {
  cpu: CpuMetrics;
};

export const CpuIndividualCore = ({cpu}: CpuIndividualCoreProps) => {
  const cores = cpu.cpuUtilizationPerCore ?? [];
  const coreCount = cpu.physicalCores ?? cores.length;

  return (
    <>
      <Header/>
      <IndividualCoreSectionContainer coreCount={coreCount}>
        {cores.slice(0, coreCount).map((v, i) => (
          <Core key={i} index={i} value={v}/>
        ))}
      </IndividualCoreSectionContainer>
    </>
  );
};