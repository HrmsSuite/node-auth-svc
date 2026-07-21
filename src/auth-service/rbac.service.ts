import { Permission, RolesModel } from "@hrmssuite/persistence";
import { Role_Dao } from "../Dao/roles.daos.js";

export class RBAC_Service {
  constructor(private readonly roleDao = new Role_Dao()) {}

  /**
   * Get all permissions for an employee
   */
  public async getEmployeePermissions(
    companyId: string,
    roleIds: string[],
  ): Promise<Permission[]> {
    const roles = await this.roleDao.getRolesByIds(companyId, roleIds);

    const permissions = roles.flatMap((role) => role.permissions);

    return [...new Set(permissions)];
  }

  /**
   * Check single permission
   */
  public async hasPermission(
    companyId: string,
    roleIds: string[],
    permission: Permission,
  ): Promise<boolean> {
    const permissions = await this.getEmployeePermissions(companyId, roleIds);

    return permissions.includes(permission);
  }

  /**
   * Check all permissions
   */
  public async hasAllPermissions(
    companyId: string,
    roleIds: string[],
    requiredPermissions: Permission[],
  ): Promise<boolean> {
    const permissions = await this.getEmployeePermissions(companyId, roleIds);

    return requiredPermissions.every((permission) =>
      permissions.includes(permission),
    );
  }

  /**
   * Check any permission
   */
  public async hasAnyPermission(
    companyId: string,
    roleIds: string[],
    requiredPermissions: Permission[],
  ) {
    if (!roleIds.length) {
      return false;
    }

    const roles = await RolesModel.find({
      companyId,
      _id: {
        $in: roleIds,
      },
      isActive: true,
      isDeleted: false,
    });

    const userPermissions = roles.flatMap((role) => role.permissions);

    return requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );
  }
}

export const rbacService = new RBAC_Service();
