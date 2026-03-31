import { Request, Response } from 'express';
import { getNetworkMetrics } from "../services/network.service.js";

export function getNetwork(req: Request, res: Response) {
  res.json(getNetworkMetrics());
}