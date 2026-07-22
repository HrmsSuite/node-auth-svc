import { Router } from "express";
import { authenticate } from "@hrmssuite/persistence";

import { Asyncwrapper } from "../common/middleware/asyncwrapper.js";
import { RBAC_Controller } from "../controller/rbac.controller.js";

const rbacController = new RBAC_Controller();

export class RBAC_Routing {
  public routing = Router();

  constructor() {
    this.routingInitializer();
  }

  private routingInitializer() {
    this.routing.get(
      "/",
      authenticate,
      Asyncwrapper((req, res, next) =>
        rbacController.getMyPermissions(req, res, next),
      ),
    );
  }
}
