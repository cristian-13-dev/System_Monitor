import { useEffect, useMemo, useState } from 'react'
import { apiUrl } from '../network-widget/constants.ts'

type DiskCategory = { category: string; value: number }
type PhysicalDisk  = { model: string; type: string; size: number }
type PartitionMetrics = {
  mount: string
  label: string
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
  Used:           '#64748b',
  Free:           '#1e293b',
}

function getColor(category: string) {
  return CATEGORY_COLORS[category] ?? '#475569'
}

function formatGb(v: number) {
  return `${v.toFixed(1)} GB`
}

function PartitionRow({ partition }: { partition: PartitionMetrics }) {
  const sorted = useMemo(() => {
    return [...partition.categories]
      .filter(c => c.category !== 'Free')
      .sort((a, b) => b.value - a.value)
  }, [partition.categories])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium text-slate-200">{partition.label}</span>
        <span>{formatGb(partition.used)} / {formatGb(partition.total)}</span>
      </div>

      <div className="flex h-4 w-full overflow-hidden rounded-lg" style={{ gap: '2px' }}>
        {sorted.map(cat => (
          <div
            key={cat.category}
            style={{
              width: `${cat.value}%`,
              backgroundColor: getColor(cat.category),
              borderRadius: '3px',
              transition: 'width 0.6s ease',
            }}
          />
        ))}
        <div
          style={{
            flex: 1,
            backgroundColor: getColor('Free'),
            borderRadius: '3px',
          }}
        />
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
        {sorted.map(cat => (
          <div key={cat.category} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm flex-shrink-0" style={{ backgroundColor: getColor(cat.category) }} />
            <span className="text-xs text-slate-400">{cat.category}</span>
            <span className="text-xs font-medium text-slate-200">{cat.value.toFixed(1)}%</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm flex-shrink-0 border border-slate-700" style={{ backgroundColor: getColor('Free') }} />
          <span className="text-xs text-slate-400">Free</span>
          <span className="text-xs font-medium text-slate-200">{formatGb(partition.available)}</span>
        </div>
      </div>
    </div>
  )
}

export default function StorageWidget() {
  const [data, setData]       = useState<StorageMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const fetch_ = async () => {
      try {
        setError(null)
        const res = await fetch(`${apiUrl}/storage`)
        if (!res.ok) throw new Error(`${res.status}`)
        const json: StorageMetrics = await res.json()
        if (mounted) setData(json)
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void fetch_()
    const id = setInterval(() => void fetch_(), FIFTEEN_MINUTES)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  const totalSize = useMemo(
    () => data?.disks.reduce((s, d) => s + d.size, 0) ?? 0,
    [data]
  )

  const disk = data?.disks[0]

  if (loading) return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-slate-50 shadow-lg">
      <p className="text-lg font-semibold">Storage</p>
      <p className="mt-1 text-sm text-slate-400">Loading...</p>
    </div>
  )

  if (error) return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-slate-50 shadow-lg">
      <p className="text-lg font-semibold">Storage</p>
      <p className="mt-1 text-sm text-red-400">{error}</p>
    </div>
  )

  if (!data) return null

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-slate-50 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-semibold">Storage</p>
          {disk && (
            <p className="mt-0.5 text-sm text-slate-400">
              {disk.model} • {disk.type} • {formatGb(totalSize)}
            </p>
          )}
        </div>
        <p className="text-xs text-slate-500">
          {data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString() : '—'}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-5">
        {data.partitions.map(p => (
          <PartitionRow key={p.mount} partition={p} />
        ))}
      </div>
    </div>
  )
}