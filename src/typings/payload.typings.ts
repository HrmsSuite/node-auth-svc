import { Permission } from "@hrmssuite/persistence";

export type Payload = {
  id: string;

  companyId: string;

  role?: "admin" | "employee";

  employeeId?: string;

  roleIds?: string[];

  permissions?: Permission[];
};
