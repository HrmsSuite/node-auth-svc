import { IRole } from "@hrmssuite/persistence";
import { Apperror } from "../common/utils/error.js";
import { IRoleListFilters } from "../typings/IRoleListFilters.typings.js";
import { CreateRoleSchemaType } from "../common/validators/roles/createRole.zod.js";
import { Role_Dao } from "../Dao/roles.daos.js";
import { UpdateRoleSchemaType } from "../common/validators/roles/updateRole.zod.js";
import { Types } from "mongoose";

export class Role_Service {
  private roleDao: Role_Dao;

  constructor() {
    this.roleDao = new Role_Dao();
  }

  /**
   * Create Role
   * Ensures name/code are unique within the company before creating.
   */
  public async createRole(
    companyId: string,
    userId: string,
    data: CreateRoleSchemaType,
  ): Promise<IRole> {
    const [existingByCode, existingByName] = await Promise.all([
      this.roleDao.getRoleByCode(companyId, data.code),
      this.roleDao.getRoleByName(companyId, data.name),
    ]);

    if (existingByCode) {
      throw new Apperror("Role code already exists", 409);
    }

    if (existingByName) {
      throw new Apperror("Role name already exists", 409);
    }

    const role = await this.roleDao.createRole({
      ...data,

      permissionIds: data.permissionIds.map((id) => new Types.ObjectId(id)),

      companyId: new Types.ObjectId(companyId),

      createdBy: new Types.ObjectId(userId),

      isDeleted: false,
    });

    return role;
  }

  /**
   * Get Role By Id
   */
  public async getRoleById(companyId: string, roleId: string): Promise<IRole> {
    return this.roleDao.getRoleById(companyId, roleId);
  }

  /**
   * Get Roles By Ids (used internally for RBAC checks)
   */
  public async getRolesByIds(
    companyId: string,
    roleIds: string[],
  ): Promise<IRole[]> {
    if (!roleIds?.length) {
      return [];
    }

    return this.roleDao.getRolesByIds(companyId, roleIds);
  }

  /**
   * List Roles
   */
  public async getRoles(companyId: string, filters: IRoleListFilters) {
    return this.roleDao.getRoles(companyId, filters);
  }

  /**
   * Update Role
   * Prevents duplicate name/code (excluding the current role) before updating.
   */
  /**
   * Update Role
   * Prevents duplicate name/code (excluding the current role) before updating.
   */
  public async editRole(
    companyId: string,
    roleId: string,
    data: UpdateRoleSchemaType,
  ): Promise<IRole> {
    const existingRole = await this.roleDao.getRoleById(companyId, roleId);

    if (data.code && data.code !== existingRole.code) {
      const codeConflict = await this.roleDao.getRoleByCode(
        companyId,
        data.code,
      );

      if (codeConflict) {
        throw new Apperror("Role code already exists", 409);
      }
    }

    if (data.name && data.name !== existingRole.name) {
      const nameConflict = await this.roleDao.getRoleByName(
        companyId,
        data.name,
      );

      if (nameConflict) {
        throw new Apperror("Role name already exists", 409);
      }
    }

    const { permissionIds, ...rest } = data;

    const updatePayload: Partial<IRole> = {
      ...rest,
      ...(permissionIds !== undefined && {
        permissionIds: permissionIds.map((id) => new Types.ObjectId(id)),
      }),
    };

    return this.roleDao.editRole(companyId, roleId, updatePayload);
  }

  /**
   * Activate / Deactivate Role
   */
  public async updateRoleStatus(
    companyId: string,
    roleId: string,
    isActive: boolean,
  ): Promise<IRole> {
    if (!isActive) {
      const isAssigned = await this.roleDao.isRoleAssigned(companyId, roleId);

      if (isAssigned) {
        throw new Apperror(
          "Role is assigned to one or more employees and cannot be deactivated.",
          400,
        );
      }
    }

    return this.roleDao.updateRoleStatus(companyId, roleId, isActive);
  }

  /**
   * Soft Delete Role
   */
  public async deleteRole(
    companyId: string,
    roleId: string,
    deletedBy: string,
  ): Promise<IRole> {
    const existingRole = await this.roleDao.getRoleById(companyId, roleId);

    if (existingRole.type === "SYSTEM") {
      throw new Apperror("System roles cannot be deleted", 400);
    }

    return this.roleDao.deleteRole(companyId, roleId, deletedBy);
  }
}
