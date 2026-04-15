import {useEffect, useMemo, useState} from 'react'
import {apiUrl} from '../network-widget/constants.ts'

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

function formatGb(value: number) {
  return `${value.toFixed(2)} GB`
}

function getCategoryColor(category: string) {
  switch (category) {
    case 'System':
      return 'bg-blue-500'
    case 'Docker':
      return 'bg-cyan-500'
    case 'User':
      return 'bg-green-500'
    case 'Logs & Cache':
      return 'bg-amber-500'
    case 'Other':
      return 'bg-violet-500'
    case 'Free':
      return 'bg-slate-700'
    default:
      return 'bg-slate-500'
  }
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
        if (!response.ok) {
          throw new Error(`Failed to fetch storage: ${response.status}`)
        }

        const result: StorageMetrics = await response.json()

        if (isMounted) {
          setData(result)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void fetchStorage()

    const interval = setInterval(() => {
      void fetchStorage()
    }, FIFTEEN_MINUTES)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  const totalDiskSize = useMemo(() => {
    if (!data) return 0
    return data.disks.reduce((sum, disk) => sum + disk.size, 0)
  }, [data])

  if (loading) {
    return (
      <div className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-slate-50 shadow-lg">
        <div className="text-lg font-semibold">Storage</div>
        <div className="mt-1 text-sm text-slate-400">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-slate-50 shadow-lg">
        <div className="text-lg font-semibold">Storage</div>
        <div className="mt-1 text-sm text-red-400">{error}</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-slate-50 shadow-lg">
        <div className="text-lg font-semibold">Storage</div>
        <div className="mt-1 text-sm text-slate-400">No data available</div>
      </div>
    )
  }

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-slate-50 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Storage</div>
          <div className="mt-1 text-sm text-slate-400">
            {data.disks.length} disk{data.disks.length !== 1 ? 's' : ''} • {formatGb(totalDiskSize)}
          </div>
        </div>

        <div className="text-xs text-slate-500">
          {data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString() : '—'}
        </div>
      </div>

      {data.disks.length > 0 && (
        <div className="mt-4 grid gap-2">
          {data.disks.map((disk, index) => (
            <div
              key={`${disk.model}-${index}`}
              className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2"
            >
              <div className="text-sm font-medium text-slate-100">{disk.model}</div>
              <div className="mt-1 text-xs text-slate-400">
                {disk.type} • {disk.interfaceType} • {formatGb(disk.size)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {data.partitions.map(partition => {
          const safeCategories = partition.categories ?? []
          const freePercent = partition.total > 0 ? (partition.available / partition.total) * 100 : 0

          return (
            <div
              key={partition.mount}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-100">{partition.mount}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    {partition.fsType} • {formatGb(partition.used)} used of {formatGb(partition.total)}
                  </div>
                </div>

                <div className="text-xl font-bold text-slate-50">
                  {partition.usePercent.toFixed(1)}%
                </div>
              </div>

              <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-slate-800">
                {safeCategories.map(category => {
                  const width = partition.total > 0 ? (category.value / partition.total) * 100 : 0

                  return (
                    <div
                      key={category.category}
                      title={`${category.category}: ${formatGb(category.value)}`}
                      className={getCategoryColor(category.category)}
                      style={{width: `${width}%`}}
                    />
                  )
                })}

                <div
                  title={`Free: ${formatGb(partition.available)}`}
                  className={getCategoryColor('Free')}
                  style={{width: `${freePercent}%`}}
                />
              </div>

              <div className="mt-4 grid gap-2">
                {safeCategories.map(category => (
                  <div
                    key={category.category}
                    className="grid grid-cols-[12px_minmax(0,1fr)_auto] items-center gap-2 text-sm"
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${getCategoryColor(category.category)}`} />
                    <span className="truncate text-slate-300">{category.category}</span>
                    <span className="text-slate-400">{formatGb(category.value)}</span>
                  </div>
                ))}

                <div className="grid grid-cols-[12px_minmax(0,1fr)_auto] items-center gap-2 text-sm">
                  <span className={`h-2.5 w-2.5 rounded-full ${getCategoryColor('Free')}`} />
                  <span className="truncate text-slate-300">Free</span>
                  <span className="text-slate-400">{formatGb(partition.available)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}