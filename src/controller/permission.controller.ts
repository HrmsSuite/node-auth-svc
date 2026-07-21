import { Request, Response, NextFunction } from "express";

import { Apperror } from "../common/utils/error.js";
import { PermissionService } from "../auth-service/permissions.service.js";
import {
  CreatePermissionValidator,
  UpdatePermissionValidator,
} from "../common/validators/Permission.validator.js";

export class PermissionController {
  private permissionService: PermissionService;

  constructor() {
    this.permissionService = new PermissionService();
  }

  /**
   * Create Permission
   */
  public createPermission = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const payload = CreatePermissionValidator.parse(req.body);

      const permission = await this.permissionService.createPermission(payload);

      return res.status(201).json({
        success: true,
        message: "Permission created successfully",
        data: permission,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get All Permissions
   */
  public getAllPermissions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const permissions = await this.permissionService.getAllPermissions();

      return res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get Permission By Id
   */
  public getPermissionById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;

      if (!id || Array.isArray(id)) {
        throw new Apperror("Invalid permission id", 400);
      }

      const permission = await this.permissionService.getPermissionById(id);

      return res.status(200).json({
        success: true,
        data: permission,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update Permission
   */
  public updatePermission = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;

      if (!id || Array.isArray(id)) {
        throw new Apperror("Invalid permission id", 400);
      }
      const payload = UpdatePermissionValidator.parse(req.body);

      const permission = await this.permissionService.updatePermission(
        id,
        payload,
      );

      return res.status(200).json({
        success: true,
        message: "Permission updated successfully",
        data: permission,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Activate / Deactivate Permission
   */
  public updatePermissionStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;

      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        throw new Apperror("isActive must be boolean", 400);
      }

      if (!id || Array.isArray(id)) {
        throw new Apperror("Invalid permission id", 400);
      }
      const permission = await this.permissionService.updatePermissionStatus(
        id,
        isActive,
      );

      return res.status(200).json({
        success: true,
        message: `Permission ${
          isActive ? "activated" : "deactivated"
        } successfully`,
        data: permission,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete Permission
   */
  public deletePermission = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;

      if (!id || Array.isArray(id)) {
        throw new Apperror("Invalid permission id", 400);
      }
      await this.permissionService.deletePermission(id);

      return res.status(200).json({
        success: true,
        message: "Permission deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get Permissions By Module
   */
  public getPermissionsByModule = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { module } = req.params;

      if (!module || Array.isArray(module)) {
        throw new Apperror("Invalid permission module", 400);
      }
      const permissions =
        await this.permissionService.getPermissionsByModule(module);

      return res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      next(error);
    }
  };
}
