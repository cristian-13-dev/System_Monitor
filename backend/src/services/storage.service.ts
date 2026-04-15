import si from 'systeminformation'
import { exec } from 'child_process'
import { promisify } from 'util'
import { formatToGb } from '../utils/formatToGb.js'

const execAsync = promisify(exec)

export type DiskCategory = {
  name: string
  category: string
  gb: number
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

const EXCLUDED_FS = new Set(['tmpfs', 'efivarfs', 'devtmpfs', 'squashfs', 'overlay'])

const CATEGORY_DIRS: Record<string, { name: string; paths: string[] }[]> = {
  '/': [
    { name: 'System', paths: ['/usr', '/etc'] },
    { name: 'Docker', paths: ['/var/lib/docker'] },
    { name: 'User', paths: ['/home', '/root', '/opt'] },
    { name: 'Logs & Cache', paths: ['/var/log', '/var/cache'] },
  ],
}

async function getDirBytes(path: string): Promise<number> {
  try {
    const { stdout } = await execAsync(`du -sb ${path} 2>/dev/null | cut -f1`)
    return parseInt(stdout.trim(), 10) || 0
  } catch {
    return 0
  }
}

async function buildCategories(mount: string, usedBytes: number): Promise<DiskCategory[]> {
  const defs = CATEGORY_DIRS[mount]
  if (!defs) return []

  const resolved = await Promise.all(
    defs.map(async ({ name, paths }) => {
      const sizes = await Promise.all(paths.map(getDirBytes))
      return {
        name,
        category: name,
        bytes: sizes.reduce((a, b) => a + b, 0),
      }
    })
  )

  const sumKnown = resolved.reduce((a, b) => a + b.bytes, 0)
  const otherBytes = Math.max(0, usedBytes - sumKnown)

  return [
    ...resolved.map(({ name, category, bytes }) => ({
      name,
      category,
      gb: formatToGb(bytes),
    })),
    {
      name: 'Other',
      category: 'Other',
      gb: formatToGb(otherBytes),
    },
  ]
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
  }, 15 * 60 * 1000)
}

export function getStorageMetrics(): StorageMetrics {
  return storageMetrics
}