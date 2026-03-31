import { Router } from 'express';
import { getSystem } from "../controllers/system.controller.js";

const router: Router = Router();

router.get('/system', getSystem);

export default router;