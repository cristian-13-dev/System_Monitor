import { Router } from 'express';
import { getRAMMetrics } from "../controllers/memory.controller.js";

const router = Router();

router.get('/memory', getRAMMetrics);

export default router;