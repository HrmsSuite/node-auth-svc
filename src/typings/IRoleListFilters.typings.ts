import { RoleType } from "@hrmssuite/persistence";

export interface IRoleListFilters {
  page?: number;
  limit?: number;

  search?: string;

  isActive?: boolean;

  type?: RoleType;

  sortBy?: "name" | "createdAt" | "updatedAt";

  sortOrder?: "asc" | "desc";
}
