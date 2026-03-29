import { Router } from 'express';
import { getCPUMetrics } from '../controllers/cpu.controller.js';

const router = Router();

router.get('/cpu', getCPUMetrics);

export default router;