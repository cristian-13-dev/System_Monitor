import { Router } from "express";
import { getFullSystemMetrics } from "../controllers/metrics.controller.js";

const router = Router();

router.get("/metrics", getFullSystemMetrics);

export default router;