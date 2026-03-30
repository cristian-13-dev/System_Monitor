import { Router } from 'express';
import { getRam } from "../controllers/memory.controller.js";

const router = Router();

router.get('/memory', getRam);

export default router;