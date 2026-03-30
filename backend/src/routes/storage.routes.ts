import { Router } from 'express';
import { getStorage } from '../controllers/storage.controller.js'

const router = Router();

router.get('/storage', getStorage);

export default router;