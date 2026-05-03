import { Router } from "express";
import { Routing } from "./admin.routes.js"; 
import { AccountRouting } from "./accounts.routes.js";

const router = Router();

const path = "/api/v1/auth";

const authRouting = new Routing();
const accountRouting = new AccountRouting(); 

router.use(`${path}/login`, authRouting.routing);
router.use(path, authRouting.routing);
router.use(`${path}/account`,accountRouting.routing)
export default router;