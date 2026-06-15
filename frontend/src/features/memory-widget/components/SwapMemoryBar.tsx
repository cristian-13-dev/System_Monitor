import type {MemorySwap} from '../types';
import {ArrowLeftRight} from 'lucide-react';
import {COLOR} from '../constants';
import {MemoryUsageBar} from './MemoryBar';

interface SwapMemoryBarProps {
  swap: MemorySwap;
}

export const SwapMemoryBar = ({swap}: SwapMemoryBarProps) => {
  const {usagePercentage, used, available, total} = swap;
  return (
    <MemoryUsageBar
      icon={ArrowLeftRight}
      title="Swap"
      color={COLOR.swap}
      percentage={usagePercentage}
      usedLabel="Used"
      usedValue={used}
      freeLabel="Free"
      freeValue={available}
      total={total}
    />
  );
};