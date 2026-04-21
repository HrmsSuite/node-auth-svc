import { Router } from "express";
import { Routing } from "./admin.routes.js";

const router = Router();

const path = "/api/v1/auth";

const authRouting = new Routing();

router.use(`${path}/login`, authRouting.routing);
router.use(path, authRouting.routing);
export default router;