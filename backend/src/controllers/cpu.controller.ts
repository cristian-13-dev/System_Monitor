import { Request, Response } from 'express';
import { getCpuMetrics } from '../services/cpu.service.js';

export function getCpu(req: Request, res: Response): void {
  res.json(getCpuMetrics());
}