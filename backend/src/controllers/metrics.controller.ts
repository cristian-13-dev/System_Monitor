import { Request, Response } from 'express';
import { getCpuMetrics } from '../services/cpu.service.js';
import { getMemoryMetrics } from '../services/memory.service.js';
import { getStorageMetrics } from '../services/storage.service.js';

export function getSystemMetrics(_req: Request, res: Response): void {
  res.json({
    cpu: getCpuMetrics(),
    memory: getMemoryMetrics(),
    storage: getStorageMetrics(),
  });
}