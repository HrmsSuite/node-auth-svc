import { IPermission } from "@hrmssuite/persistence";

import { PermissionDao } from "../Dao/permission.dao.js";

export class PermissionService {
  private permissionDao: PermissionDao;

  constructor() {
    this.permissionDao = new PermissionDao();
  }

  /**
   * Create Permission
   */
  public async createPermission(data: Partial<IPermission>) {
    return await this.permissionDao.createPermission(data);
  }

  /**
   * Get All Permissions
   */
  public async getAllPermissions() {
    return await this.permissionDao.getAllPermissions();
  }

  /**
   * Get Permission By Id
   */
  public async getPermissionById(permissionId: string) {
    return await this.permissionDao.getPermissionById(permissionId);
  }

  /**
   * Update Permission
   */
  public async updatePermission(
    permissionId: string,
    data: Partial<IPermission>,
  ) {
    return await this.permissionDao.updatePermission(permissionId, data);
  }

  /**
   * Activate / Deactivate Permission
   */
  public async updatePermissionStatus(permissionId: string, isActive: boolean) {
    return await this.permissionDao.updatePermissionStatus(
      permissionId,
      isActive,
    );
  }

  /**
   * Delete Permission
   */
  public async deletePermission(permissionId: string) {
    return await this.permissionDao.deletePermission(permissionId);
  }

  /**
   * Get Permissions By Module
   */
  public async getPermissionsByModule(module: string) {
    return await this.permissionDao.getPermissionsByModule(module);
  }
}
