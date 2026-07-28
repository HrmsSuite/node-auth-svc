import { Request, Response, NextFunction } from "express";

import { ACCESS_SCOPES } from "@hrmssuite/persistence";

import { Apperror } from "../utils/error.js";
import { rbacService } from "../../auth-service/rbac.service.js";
import { accessScopeService } from "../../auth-service/accessScope.service.js";

export const resolveAccessScope = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new Apperror("Unauthorized", 401);
    }

    const { companyId, employeeId, role, roleIds = [] } = req.user;

    /**
     * Company Owner
     */
    if (role === "admin") {
      req.accessScope = {
        scope: ACCESS_SCOPES.ALL,
      };

      return next();
    }

    /**
     * Employee login must contain employeeId
     */
    if (!employeeId) {
      throw new Apperror("Employee id missing", 400);
    }

    /**
     * Get employee permissions
     */
    const permissions = await rbacService.getEmployeePermissions(
      companyId,
      roleIds,
    );
    console.log("Permissions:", permissions);
    /**
     * Forward JWT to employee-service
     */
    const token = req.headers.authorization;

    if (!token) {
      throw new Apperror("Authorization token missing", 401);
    }

    /**
     * Resolve employee access scope
     */
    req.accessScope = await accessScopeService.resolveEmployeeScope(
      employeeId,
      permissions,
      token,
    );
    console.log("Permissions:", permissions);
    console.log("Resolved Scope:", req.accessScope);
    next();
  } catch (err) {
    next(err);
  }
};
