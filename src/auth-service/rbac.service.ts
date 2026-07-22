import { Permission } from "@hrmssuite/persistence";
import { Role_Dao } from "../Dao/roles.daos.js";
import { PopulatedPermission } from "../typings/permission.typings.js";

export class RBAC_Service {
  constructor(private readonly roleDao = new Role_Dao()) {}

  /**
   * Get all permissions assigned to employee
   */
  public async getEmployeePermissions(
    companyId: string,
    roleIds: string[],
  ): Promise<Permission[]> {
    if (!roleIds.length) {
      return [];
    }

    const roles = await this.roleDao.getRolesWithPermissions(
      companyId,
      roleIds,
    );

    const permissions = roles.flatMap((role) =>
      role.permissionIds
        .filter((permission) => permission?.key)
        .map((permission) => permission.key),
    );

    return [...new Set(permissions)] as Permission[];
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
  ): Promise<boolean> {
    const permissions = await this.getEmployeePermissions(companyId, roleIds);

    return requiredPermissions.some((permission) =>
      permissions.includes(permission),
    );
  }
}

export const rbacService = new RBAC_Service();
