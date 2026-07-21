import { z } from "zod";
import { ROLE_TYPES } from "@hrmssuite/persistence";

export const RoleFiltersSchema = z.object({
  page: z.coerce.number().min(1).default(1),

  limit: z.coerce.number().min(1).max(100).default(10),

  search: z.string().trim().optional(),

  isActive: z.coerce.boolean().optional(),

  type: z.enum(ROLE_TYPES).optional(),
});

export type RoleFiltersSchemaType = z.infer<typeof RoleFiltersSchema>;
