import { Types } from "mongoose";
import {
  EmployeeModel,
  WorkflowModel,
  IRole,
  RolesModel,
} from "@hrmssuite/persistence";

import { Apperror } from "../common/utils/error.js";
import { IRoleListFilters } from "../typings/IRoleListFilters.typings.js";
import { RoleWithPermissions } from "../typings/permission.typings.js";

const toObjectId = (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Apperror("Invalid id", 400);
  }

  return new Types.ObjectId(id);
};

export class Role_Dao {
  /**
   * Create Role
   */
  public async createRole(data: Partial<IRole>): Promise<IRole> {
    try {
      if (!data.companyId || !data.code) {
        throw new Apperror("Company and role code required", 400);
      }

      const existingRole = await RolesModel.findOne({
        companyId: data.companyId,
        code: data.code.toUpperCase(),
        isDeleted: false,
      });

      if (existingRole) {
        throw new Apperror("Role already exists", 400);
      }

      const role = await RolesModel.create({
        ...data,
        code: data.code.toUpperCase(),
      });

      return role;
    } catch (err) {
      if (err instanceof Apperror) throw err;

      throw new Apperror("Failed to create role", 500);
    }
  }

  private getPermissionLookupStage() {
    return {
      $lookup: {
        from: "permissions", // collection name
        localField: "permissionIds", // ObjectId[] on Role
        foreignField: "_id",
        as: "permissions",
        pipeline: [
          {
            $match: {
              isActive: true, // only hydrate active permissions
            },
          },
          {
            $project: {
              _id: 1,
              key: 1,
              module: 1,
              action: 1,
              name: 1,
              description: 1,
            },
          },
        ],
      },
    };
  }

  /**
   * Get Role By Id
   */
  public async getRoleById(companyId: string, roleId: string): Promise<IRole> {
    try {
      const role = await RolesModel.aggregate([
        {
          $match: {
            _id: toObjectId(roleId),
            companyId: toObjectId(companyId),
            isDeleted: false,
          },
        },
        this.getPermissionLookupStage(),
      ]);

      if (!role.length) {
        throw new Apperror("Role not found", 404);
      }

      return role[0] as IRole;
    } catch (err) {
      if (err instanceof Apperror) throw err;
      throw new Apperror("Failed to fetch role", 500);
    }
  }

  /**
   * Get Role By Code
   */
  public async getRoleByCode(
    companyId: string,
    code: string,
  ): Promise<IRole | null> {
    try {
      return await RolesModel.findOne({
        companyId: toObjectId(companyId),

        code: code.toUpperCase(),

        isDeleted: false,
      }).lean();
    } catch (err) {
      throw new Apperror("Failed to fetch role", 500);
    }
  }

  /**
   * Get Role By Name
   */
  public async getRoleByName(
    companyId: string,
    name: string,
  ): Promise<IRole | null> {
    try {
      return await RolesModel.findOne({
        companyId: toObjectId(companyId),

        name,

        isDeleted: false,
      }).lean();
    } catch (err) {
      throw new Apperror("Failed to fetch role", 500);
    }
  }

  /**
   * Get Roles By Ids
   * RBAC
   */
  public async getRolesByIds(
    companyId: string,
    roleIds: string[],
  ): Promise<IRole[]> {
    try {
      if (!roleIds.length) {
        return [];
      }

      return await RolesModel.find({
        companyId: toObjectId(companyId),

        _id: {
          $in: roleIds.map((id) => toObjectId(id)),
        },

        isDeleted: false,

        isActive: true,
      }).lean();
    } catch (err) {
      throw new Apperror("Failed to fetch roles", 500);
    }
  }

  /**
   * Pagination + Search + Filter
   */
  /**
   * Pagination + Search + Filter
   */
  public async getRoles(companyId: string, filters: IRoleListFilters) {
    try {
      const { page = 1, limit = 10, search, isActive, type } = filters;

      const query: any = {
        companyId: toObjectId(companyId),
        isDeleted: false,
      };

      if (typeof isActive === "boolean") {
        query.isActive = isActive;
      }

      if (type) {
        query.type = type;
      }

      if (search?.trim()) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { code: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const skip = (page - 1) * limit;

      const [roles, total] = await Promise.all([
        RolesModel.aggregate([
          { $match: query },
          this.getPermissionLookupStage(),
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
        ]),

        RolesModel.countDocuments(query),
      ]);

      return {
        roles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPreviousPage: page > 1,
        },
      };
    } catch (err) {
      throw new Apperror("Failed to fetch roles", 500);
    }
  }

  /**
   * Update Role
   */
  public async editRole(
    companyId: string,
    roleId: string,
    data: Partial<IRole>,
  ): Promise<IRole> {
    try {
      const existingRole = await this.getRoleById(companyId, roleId);

      if (existingRole.type === "SYSTEM") {
        throw new Apperror("System roles cannot be modified", 400);
      }

      const forbiddenFields = [
        "_id",

        "companyId",

        "type",

        "createdAt",

        "updatedAt",

        "deletedAt",

        "deletedBy",

        "isDeleted",
      ];

      const setFields: any = {};

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && !forbiddenFields.includes(key)) {
          setFields[key] = value;
        }
      });

      const updatedRole = await RolesModel.findOneAndUpdate(
        {
          _id: toObjectId(roleId),

          companyId: toObjectId(companyId),

          isDeleted: false,
        },

        {
          $set: setFields,
        },

        {
          new: true,
          runValidators: true,
        },
      );

      if (!updatedRole) {
        throw new Apperror("Role not found", 404);
      }

      return updatedRole;
    } catch (err) {
      if (err instanceof Apperror) throw err;

      throw new Apperror("Failed to update role", 500);
    }
  }

  public async getRolesWithPermissions(
    companyId: string,
    roleIds: string[],
  ): Promise<RoleWithPermissions[]> {
    return RolesModel.find({
      companyId: toObjectId(companyId),
      _id: { $in: roleIds.map((id) => toObjectId(id)) },
      isActive: true,
      isDeleted: false,
    })
      .populate("permissionIds")
      .lean() as unknown as RoleWithPermissions[];
  }

  /**
   * Role Assigned Check
   */
  public async isRoleAssigned(
    companyId: string,
    roleId: string,
  ): Promise<boolean> {
    const employee = await EmployeeModel.exists({
      companyId: toObjectId(companyId),

      "data.job.roleIds": toObjectId(roleId),

      "meta.isDeleted": false,
    });

    return !!employee;
  }

  /**
   * Update Role Status (Activate/Deactivate)
   */
  public async updateRoleStatus(
    companyId: string,
    roleId: string,
    isActive: boolean,
  ): Promise<IRole> {
    try {
      const role = await RolesModel.findOneAndUpdate(
        {
          _id: toObjectId(roleId),

          companyId: toObjectId(companyId),

          isDeleted: false,
        },

        {
          $set: {
            isActive,
          },
        },

        {
          new: true,
        },
      );

      if (!role) {
        throw new Apperror("Role not found", 404);
      }

      return role;
    } catch (err) {
      if (err instanceof Apperror) throw err;

      throw new Apperror("Failed to update role status", 500);
    }
  }

  /**
   * Delete Role
   */
  public async deleteRole(
    companyId: string,
    roleId: string,
    deletedBy: string,
  ): Promise<IRole> {
    try {
      const assigned = await this.isRoleAssigned(companyId, roleId);

      if (assigned) {
        throw new Apperror(
          "Role assigned to employees. Reassign before deleting.",
          400,
        );
      }

      const workflowUsed = await WorkflowModel.exists({
        companyId: toObjectId(companyId),

        "levels.roleId": toObjectId(roleId),

        isDeleted: false,
      });

      if (workflowUsed) {
        throw new Apperror(
          "Role is used in workflow. Remove workflow dependency first.",
          400,
        );
      }

      const role = await RolesModel.findOneAndUpdate(
        {
          _id: toObjectId(roleId),

          companyId: toObjectId(companyId),

          isDeleted: false,
        },

        {
          $set: {
            isDeleted: true,

            isActive: false,

            deletedAt: new Date(),

            deletedBy: toObjectId(deletedBy),
          },
        },

        {
          new: true,
        },
      );

      if (!role) {
        throw new Apperror("Role not found", 404);
      }

      return role;
    } catch (err) {
      if (err instanceof Apperror) throw err;

      throw new Apperror("Failed to delete role", 500);
    }
  }
}
