import { Router } from "express";
import { getSystemMetrics } from "../controllers/metrics.controller.js";

const router = Router();

router.get("/metrics", getSystemMetrics);

export default router;