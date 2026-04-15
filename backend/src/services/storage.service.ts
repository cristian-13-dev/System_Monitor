import si from 'systeminformation'
import { exec } from 'child_process'
import { promisify } from 'util'
import { formatToGb } from '../utils/formatToGb.js'

const execAsync = promisify(exec)

export type DiskCategory = {
  category: string
  value: number
}

export type PartitionMetrics = {
  mount: string
  fsType: string
  total: number
  used: number
  available: number
  usePercent: number
  categories: DiskCategory[]
}

export type PhysicalDisk = {
  model: string
  type: string
  interfaceType: string
  size: number
}

export type StorageMetrics = {
  disks: PhysicalDisk[]
  partitions: PartitionMetrics[]
  updatedAt: string | null
}

const EXCLUDED_FS = new Set([
  'tmpfs',
  'efivarfs',
  'devtmpfs',
  'squashfs',
  'overlay',
])

const FIFTEEN_MINUTES = 15 * 60 * 1000

const CATEGORY_DIRS: Record<string, { category: string; paths: string[] }[]> = {
  '/': [
    { category: 'System', paths: ['/usr', '/etc'] },
    { category: 'Docker', paths: ['/var/lib/docker'] },
    { category: 'User', paths: ['/home', '/root', '/opt'] },
    { category: 'Logs & Cache', paths: ['/var/log', '/var/cache'] },
  ],
}

async function getDirBytes(path: string): Promise<number> {
  try {
    const { stdout } = await execAsync(`du -sb "${path}" 2>/dev/null | cut -f1`)
    return parseInt(stdout.trim(), 10) || 0
  } catch {
    return 0
  }
}

async function buildCategories(mount: string, usedBytes: number): Promise<DiskCategory[]> {
  const defs = CATEGORY_DIRS[mount]
  if (!defs) {
    return [
      {
        category: 'Other',
        value: formatToGb(usedBytes),
      },
    ]
  }

  const resolved = await Promise.all(
    defs.map(async ({ category, paths }) => {
      const sizes = await Promise.all(paths.map(getDirBytes))
      const bytes = sizes.reduce((sum, size) => sum + size, 0)

      return {
        category,
        bytes,
      }
    })
  )

  const knownBytes = resolved.reduce((sum, item) => sum + item.bytes, 0)
  const otherBytes = Math.max(0, usedBytes - knownBytes)

  return [
    ...resolved.map(({ category, bytes }) => ({
      category,
      value: formatToGb(bytes),
    })),
    {
      category: 'Other',
      value: formatToGb(otherBytes),
    },
  ].filter(item => item.value > 0)
}

let storageMetrics: StorageMetrics = {
  disks: [],
  partitions: [],
  updatedAt: null,
}

async function refreshStorageMetrics() {
  try {
    const [diskLayout, fsSizes] = await Promise.all([
      si.diskLayout(),
      si.fsSize(),
    ])

    const disks: PhysicalDisk[] = diskLayout.map(d => ({
      model: d.name,
      type: d.type,
      interfaceType: d.interfaceType,
      size: formatToGb(d.size),
    }))

    const partitions: PartitionMetrics[] = await Promise.all(
      fsSizes
        .filter(p => !EXCLUDED_FS.has(p.type) && p.mount)
        .map(async p => ({
          mount: p.mount,
          fsType: p.type,
          total: formatToGb(p.size),
          used: formatToGb(p.used),
          available: formatToGb(p.available),
          usePercent: p.use,
          categories: await buildCategories(p.mount, p.used),
        }))
    )

    storageMetrics = {
      disks,
      partitions,
      updatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Failed to refresh storage metrics', error)
  }
}

export async function startStorageMetricsPolling() {
  await refreshStorageMetrics()

  setInterval(() => {
    void refreshStorageMetrics()
  }, FIFTEEN_MINUTES)
}

export function getStorageMetrics(): StorageMetrics {
  return storageMetrics
}