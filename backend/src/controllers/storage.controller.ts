import { Request, Response } from "express";
import { getStorageMetrics } from "../services/storage.service.js";

export function getStorage(req: Request, res: Response) {
  res.json(getStorageMetrics());
}