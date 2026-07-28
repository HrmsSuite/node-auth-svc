import {
  ACCESS_SCOPES,
  AccessScopeResult,
  Permission,
  PERMISSIONS,
} from "@hrmssuite/persistence";

import { hierarchyClient } from "../clients/hierarchy.client.js";

export class AccessScopeService {
  constructor(private readonly hierarchy = hierarchyClient) {}

  /**
   * Resolve employee data access scope
   */
  public async resolveEmployeeScope(
    employeeId: string,
    permissions: Permission[],
    token: string,
  ): Promise<AccessScopeResult> {
    /**
     * Company-wide access
     */
    if (
      permissions.includes("*" as Permission) ||
      permissions.includes(PERMISSIONS.EMPLOYEE.VIEW)
    ) {
      return {
        scope: ACCESS_SCOPES.ALL,
      };
    }

    /**
     * Hierarchy access
     */
    if (permissions.includes(PERMISSIONS.EMPLOYEE.VIEW_HIERARCHY)) {
      const employeeIds = await this.hierarchy.getReports(employeeId, token);
      console.log(employeeIds);
      return {
        scope: ACCESS_SCOPES.HIERARCHY,
        employeeIds,
      };
    }

    /**
     * Self access
     */
    return {
      scope: ACCESS_SCOPES.SELF,
      employeeIds: [employeeId],
    };
  }
}

export const accessScopeService = new AccessScopeService();
