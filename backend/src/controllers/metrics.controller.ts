import { Request, Response } from 'express';
import { getSystemMetrics } from "../services/system.service.js";
import { getCpuMetrics } from '../services/cpu.service.js';
import { getMemoryMetrics } from '../services/memory.service.js';
import { getStorageMetrics } from '../services/storage.service.js';
import { getNetworkMetrics } from "../services/network.service.js";

export function getFullSystemMetrics(_req: Request, res: Response): void {
  res.json({
    system: getSystemMetrics(),
    cpu: getCpuMetrics(),
    memory: getMemoryMetrics(),
    storage: getStorageMetrics(),
    network: getNetworkMetrics(),
  });
}