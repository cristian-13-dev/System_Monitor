import type {MemoryRaw} from '../types.ts';
import {ArrowDownToLine} from 'lucide-react';
import {COLOR} from '../constants';
import {MemoryUsageBar} from './MemoryBar';

interface CachedMemoryBarProps {
  raw: MemoryRaw;
}

export const CachedMemoryBar = ({raw}: CachedMemoryBarProps) => {
  const {cached, total, free} = raw;
  const cachedPct = (cached / total) * 100;

  return (
    <MemoryUsageBar
      icon={ArrowDownToLine}
      title="Cached"
      color={COLOR.cached}
      percentage={cachedPct}
      usedLabel="Cached"
      usedValue={cached}
      freeLabel="Free"
      freeValue={free}
      total={total}
    />
  );
};