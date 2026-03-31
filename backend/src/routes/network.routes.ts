import { Router } from "express";
import { getNetwork } from "../controllers/network.controller.js";

const router = Router();
router.get('/network', getNetwork);

export default router;