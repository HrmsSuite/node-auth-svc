import { Router } from "express";
import { Asyncwrapper } from "../common/middleware/asyncwrapper.js";
import { authenticate } from "@hrmssuite/persistence";
import { AccountsController } from "../controller/account.controller.js";

const accountsController = new AccountsController();

export class AccountRouting {
  public routing = Router();

  constructor() {
    this.routingInitailser();
  }

  private routingInitailser() {
    this.routing.post(
      "/",
      authenticate,
      Asyncwrapper((req, res, next) =>
        accountsController.createAccount(req, res, next),
      ),
    );

    this.routing.patch(
      "/:employeeId/deactivate",
      authenticate,
      Asyncwrapper((req, res, next) =>
        accountsController.deactivateAccount(req, res, next),
      ),
    );
    this.routing.patch(
      "/:employeeId/activate",
      authenticate,
      Asyncwrapper((req, res, next) =>
        accountsController.activateAccount(req, res, next),
      ),
    );

    // Hard delete
    this.routing.delete(
      "/:employeeId",
      authenticate,
      Asyncwrapper((req, res, next) =>
        accountsController.deleteAccount(req, res, next),
      ),
    );
    this.routing.get(
      "/",
      authenticate,
      Asyncwrapper((req, res, next) =>
        accountsController.allAccount(req, res, next),
      ),
    );
  }
}
