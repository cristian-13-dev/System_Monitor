import { Request, Response } from 'express';
import { getCpuMetrics } from '../services/cpu.service.js';

export function getCPUMetrics(req: Request, res: Response): void {
  res.json(getCpuMetrics());
}