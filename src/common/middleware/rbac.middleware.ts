import { Request, Response, NextFunction } from "express";
import { Permission } from "@hrmssuite/persistence";
import { Apperror } from "../utils/error.js";
import { rbacService } from "../../auth-service/rbac.service.js";

export const authorize =
  (...requiredPermissions: Permission[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new Apperror("Unauthorized", 401);
      }

      const { companyId, role, roleIds = [] } = req.user;

      /**
       * Company Admin
       *
       * Company owner has full access
       */
      if (role === "admin") {
        return next();
      }

      /**
       * Employee RBAC
       */
      if (!roleIds.length) {
        throw new Apperror("No roles assigned to employee", 403);
      }

      const hasPermission = await rbacService.hasAnyPermission(
        companyId,
        roleIds,
        requiredPermissions,
      );

      if (!hasPermission) {
        throw new Apperror(
          "You do not have permission to perform this action",
          403,
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
