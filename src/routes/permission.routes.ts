import { Router } from "express";
import { Asyncwrapper } from "../common/middleware/asyncwrapper.js";
import { authenticate } from "@hrmssuite/persistence";
import { PermissionController } from "../controller/permission.controller.js";

const permissionController = new PermissionController();

export class PermissionRouting {
  public routing = Router();

  constructor() {
    this.routingInitailser();
  }

  private routingInitailser() {
    /**
     * Create Permission
     */
    this.routing.post(
      "/",
      authenticate,
      Asyncwrapper((req, res, next) =>
        permissionController.createPermission(req, res, next),
      ),
    );

    /**
     * Get All Permissions
     */
    this.routing.get(
      "/",
      authenticate,
      Asyncwrapper((req, res, next) =>
        permissionController.getAllPermissions(req, res, next),
      ),
    );

    /**
     * Get Permission By Module
     *
     * Must come before /:id
     */
    this.routing.get(
      "/module/:module",
      authenticate,
      Asyncwrapper((req, res, next) =>
        permissionController.getPermissionsByModule(req, res, next),
      ),
    );

    /**
     * Get Permission By Id
     */
    this.routing.get(
      "/:id",
      authenticate,
      Asyncwrapper((req, res, next) =>
        permissionController.getPermissionById(req, res, next),
      ),
    );

    /**
     * Update Permission
     */
    this.routing.patch(
      "/:id",
      authenticate,
      Asyncwrapper((req, res, next) =>
        permissionController.updatePermission(req, res, next),
      ),
    );

    /**
     * Activate / Deactivate Permission
     */
    this.routing.patch(
      "/:id/status",
      authenticate,
      Asyncwrapper((req, res, next) =>
        permissionController.updatePermissionStatus(req, res, next),
      ),
    );

    /**
     * Delete Permission
     */
    this.routing.delete(
      "/:id",
      authenticate,
      Asyncwrapper((req, res, next) =>
        permissionController.deletePermission(req, res, next),
      ),
    );
  }
}