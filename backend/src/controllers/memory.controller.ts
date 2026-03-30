import { Request, Response } from "express";
import { getMemoryMetrics } from "../services/memory.service.js";

export function getRAMMetrics(req: Request, res: Response): void  {
  res.json(getMemoryMetrics());
}