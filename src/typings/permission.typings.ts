import { IRole, Permission } from "@hrmssuite/persistence";

export interface PopulatedPermission {
  _id: string;
  key: Permission;
  name: string;
  module?: string;
  action?: string;
}

export interface RoleWithPermissions extends Omit<IRole, "permissionIds"> {
  permissionIds: PopulatedPermission[];
}
