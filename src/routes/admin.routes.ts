import { Router } from "express";
import { Asyncwrapper } from "../common/middleware/asyncwrapper.js";
import { AdminController } from "../controller/admin-auth.controller.js";
import { authenticate } from "@hrmssuite/persistence";
const adminController = new AdminController();
export class Routing {
  public routing = Router();

  constructor() {
    this.routingInitailser();
  }

  private routingInitailser() {
    this.routing.post("/refresh-token", Asyncwrapper(adminController.refreshController));
    this.routing.post("/login", Asyncwrapper(adminController.adminController));
    this.routing.get("/company",authenticate, Asyncwrapper(adminController.getCompanyDataById))
  }
}