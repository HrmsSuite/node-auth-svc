import { PermissionModel, IPermission } from "@hrmssuite/persistence";

import { Apperror } from "../common/utils/error.js";

export class PermissionDao {
  /**
   * Create Permission
   */
  public async createPermission(data: Partial<IPermission>) {
    const exists = await PermissionModel.findOne({
      key: data.key?.toLowerCase(),
    });

    if (exists) {
      throw new Apperror("Permission already exists", 409);
    }

    return await PermissionModel.create({
      ...data,
      key: data.key?.toLowerCase(),
    });
  }

  /**
   * Get All Permissions
   */
  public async getAllPermissions() {
    return await PermissionModel.find()
      .sort({
        module: 1,
        action: 1,
      })
      .lean();
  }

  /**
   * Get Permission By Id
   */
  public async getPermissionById(permissionId: string) {
    const permission = await PermissionModel.findById(permissionId);

    if (!permission) {
      throw new Apperror("Permission not found", 404);
    }

    return permission;
  }

  /**
   * Get Permission By Key
   */
  public async getPermissionByKey(key: string) {
    return await PermissionModel.findOne({
      key: key.toLowerCase(),
    });
  }

  /**
   * Update Permission
   */
  public async updatePermission(
    permissionId: string,
    data: Partial<IPermission>,
  ) {
    const permission = await PermissionModel.findById(permissionId);

    if (!permission) {
      throw new Apperror("Permission not found", 404);
    }

    /**
     * Prevent duplicate key
     */
    if (data.key && data.key.toLowerCase() !== permission.key) {
      const exists = await PermissionModel.findOne({
        key: data.key.toLowerCase(),
        _id: { $ne: permissionId },
      });

      if (exists) {
        throw new Apperror("Permission key already exists", 409);
      }
    }

    Object.assign(permission, {
      ...data,
      key: data.key?.toLowerCase(),
    });

    await permission.save();

    return permission;
  }

  /**
   * Activate / Deactivate
   */
  public async updatePermissionStatus(permissionId: string, isActive: boolean) {
    const permission = await PermissionModel.findById(permissionId);

    if (!permission) {
      throw new Apperror("Permission not found", 404);
    }

    permission.isActive = isActive;

    await permission.save();

    return permission;
  }

  /**
   * Delete Permission
   */
  public async deletePermission(permissionId: string) {
    const permission = await PermissionModel.findById(permissionId);

    if (!permission) {
      throw new Apperror("Permission not found", 404);
    }

    /**
     * System permissions
     * should never be deleted
     */
    if (permission.isSystem) {
      throw new Apperror("System permissions cannot be deleted", 400);
    }

    await PermissionModel.findByIdAndDelete(permissionId);

    return true;
  }

  /**
   * Module Permissions
   */
  public async getPermissionsByModule(module: string) {
    return await PermissionModel.find({
      module,
      isActive: true,
    })
      .sort({
        action: 1,
      })
      .lean();
  }
}
