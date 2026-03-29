import type { Request, Response } from 'express';

export const getMetrics = (_req: Request, res: Response) => {
  res.json({ status: "ok" });
}