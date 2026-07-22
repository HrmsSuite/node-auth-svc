import { Request, Response, NextFunction } from "express";
import { rbacService } from "../auth-service/rbac.service.js";

export class RBAC_Controller {
  public async getMyPermissions(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { companyId, role, roleIds = [], employeeId } = req.user;

      // Company Owner/Admin
      if (role === "admin") {
        return res.status(200).json({
          success: true,
          data: {
            role: "admin",
            employeeId: null,
            roleIds: [],
            permissions: ["*"],
          },
        });
      }

      const permissions = await rbacService.getEmployeePermissions(
        companyId,
        roleIds,
      );

      return res.status(200).json({
        success: true,
        data: {
          role,
          employeeId,
          roleIds,
          permissions,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
