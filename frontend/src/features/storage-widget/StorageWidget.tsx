import { useEffect, useMemo, useState } from 'react'
import { apiUrl } from '../network-widget/constants.ts'

type DiskCategory = {
  category: string
  value: number
}

type PhysicalDisk = {
  model: string
  type: string
  interfaceType: string
  size: number
}

type PartitionMetrics = {
  mount: string
  fsType: string
  total: number
  used: number
  available: number
  usePercent: number
  categories: DiskCategory[]
}

type StorageMetrics = {
  disks: PhysicalDisk[]
  partitions: PartitionMetrics[]
  updatedAt: string | null
}

const FIFTEEN_MINUTES = 15 * 60 * 1000

const CATEGORY_COLORS: Record<string, string> = {
  System:         '#4f8ef7',
  Docker:         '#22d3ee',
  User:           '#4ade80',
  'Logs & Cache': '#f59e0b',
  Other:          '#a78bfa',
  Free:           '#1e293b',
}

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#475569'
}

function formatGb(value: number) {
  return `${value.toFixed(1)} GB`
}

function PartitionBar({ partition }: { partition: PartitionMetrics }) {
  const sorted = useMemo(() => {
    const nonFree = [...(partition.categories ?? [])].filter(c => c.category !== 'Free')
    nonFree.sort((a, b) => b.value - a.value)
    return nonFree
  }, [partition.categories])

  const freePercent = partition.total > 0
    ? (partition.available / partition.total) * 100
    : 0

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-slate-100">{partition.mount}</span>
          <span className="ml-2 text-xs text-slate-500">{partition.fsType}</span>
        </div>
        <div className="text-right">
          <span className="text-base font-bold text-slate-50">{formatGb(partition.used)}</span>
          <span className="text-xs text-slate-500"> / {formatGb(partition.total)}</span>
        </div>
      </div>

      <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
        {sorted.map(cat => (
          <div
            key={cat.category}
            style={{
              width: `${cat.value}%`,
              backgroundColor: getCategoryColor(cat.category),
              transition: 'width 0.6s ease',
            }}
          />
        ))}
        <div
          style={{
            width: `${freePercent}%`,
            backgroundColor: getCategoryColor('Free'),
          }}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {sorted.map(cat => (
          <div key={cat.category} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: getCategoryColor(cat.category) }}
            />
            <span className="text-xs text-slate-400">{cat.category}</span>
            <span className="text-xs font-medium text-slate-200">{cat.value.toFixed(1)}%</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full flex-shrink-0 border border-slate-600"
            style={{ backgroundColor: getCategoryColor('Free') }}
          />
          <span className="text-xs text-slate-400">Free</span>
          <span className="text-xs font-medium text-slate-200">{formatGb(partition.available)}</span>
        </div>
      </div>
    </div>
  )
}

export default function StorageWidget() {
  const [data, setData] = useState<StorageMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchStorage = async () => {
      try {
        setError(null)
        const response = await fetch(`${apiUrl}/storage`)
        if (!response.ok) throw new Error(`Failed to fetch storage: ${response.status}`)
        const result: StorageMetrics = await response.json()
        if (isMounted) setData(result)
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void fetchStorage()
    const interval = setInterval(() => void fetchStorage(), FIFTEEN_MINUTES)
    return () => { isMounted = false; clearInterval(interval) }
  }, [])

  const totalDiskSize = useMemo(() =>
      data?.disks.reduce((sum, d) => sum + d.size, 0) ?? 0
    , [data])

  if (loading) return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-slate-50 shadow-lg">
      <div className="text-lg font-semibold">Storage</div>
      <div className="mt-1 text-sm text-slate-400">Loading...</div>
    </div>
  )

  if (error) return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-slate-50 shadow-lg">
      <div className="text-lg font-semibold">Storage</div>
      <div className="mt-1 text-sm text-red-400">{error}</div>
    </div>
  )

  if (!data) return null

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-slate-50 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-semibold">Storage</div>
          <div className="mt-0.5 text-sm text-slate-400">
            {data.disks.length} disk{data.disks.length !== 1 ? 's' : ''} • {formatGb(totalDiskSize)}
          </div>
        </div>
        <div className="text-xs text-slate-500">
          {data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString() : '—'}
        </div>
      </div>

      {data.disks.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {data.disks.map((disk, i) => (
            <div
              key={`${disk.model}-${i}`}
              className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5"
            >
              <span className="text-xs font-medium text-slate-200">{disk.model}</span>
              <span className="ml-2 text-xs text-slate-500">
                {disk.type} • {disk.interfaceType} • {formatGb(disk.size)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {data.partitions.map(partition => (
          <PartitionBar key={partition.mount} partition={partition} />
        ))}
      </div>
    </div>
  )
}