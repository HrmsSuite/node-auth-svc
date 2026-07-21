import { Router } from "express";
import { Routing } from "./admin.routes.js";
import { AccountRouting } from "./accounts.routes.js";
import { RoleRouting } from "./role.routes.js";
import { PermissionRouting } from "./permission.routes.js";

const router = Router();

const path = "/api/v1/auth";

const authRouting = new Routing();
const accountRouting = new AccountRouting();
const roleRouting = new RoleRouting();
const permissionRouting = new PermissionRouting();

router.use(`${path}/login`, authRouting.routing);
router.use(path, authRouting.routing);
router.use(`${path}/account`, accountRouting.routing);
router.use(`${path}/roles`, roleRouting.routing);
router.use(`${path}/permissions`, permissionRouting.routing);
export default router;
