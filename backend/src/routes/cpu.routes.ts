import { Router } from 'express';
import { getCpu } from '../controllers/cpu.controller.js';

const router = Router();

router.get('/cpu', getCpu);

export default router;