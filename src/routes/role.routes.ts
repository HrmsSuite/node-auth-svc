import { Router } from "express";
import { Asyncwrapper } from "../common/middleware/asyncwrapper.js";
import { authenticate } from "@hrmssuite/persistence";
import { RoleController } from "../controller/role.controller.js";

const roleController = new RoleController();

export class RoleRouting {
  public routing = Router();

  constructor() {
    this.routingInitailser();
  }

  private routingInitailser() {
    /* Create Role */
    this.routing.post(
      "/",
      authenticate,
      Asyncwrapper((req, res, next) =>
        roleController.createRole(req, res, next),
      ),
    );

    /* Get All Roles */
    this.routing.get(
      "/",
      authenticate,
      Asyncwrapper((req, res, next) => roleController.findAll(req, res, next)),
    );

    /* Get Role By Id */
    this.routing.get(
      "/:id",
      authenticate,
      Asyncwrapper((req, res, next) =>
        roleController.findById(req, res, next),
      ),
    );

    /* Update Role */
    this.routing.patch(
      "/:id",
      authenticate,
      Asyncwrapper((req, res, next) =>
        roleController.updateRole(req, res, next),
      ),
    );

    /* Activate / Deactivate Role */
    this.routing.patch(
      "/:id/status",
      authenticate,
      Asyncwrapper((req, res, next) =>
        roleController.updateRoleStatus(req, res, next),
      ),
    );

    /* Delete Role */
    this.routing.delete(
      "/:id",
      authenticate,
      Asyncwrapper((req, res, next) =>
        roleController.deleteRole(req, res, next),
      ),
    );
  }
}