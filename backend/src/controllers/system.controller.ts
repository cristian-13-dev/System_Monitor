import { Request, Response } from 'express';
import { getSystemMetrics } from '../services/system.service.js'

export function getSystem(req: Request, res: Response) {
  res.json(getSystemMetrics());
}