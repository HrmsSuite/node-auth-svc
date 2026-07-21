import { z } from "zod";
import { ROLE_TYPES, PERMISSIONS, Permission } from "@hrmssuite/persistence";

export const UpdateRoleSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),

  code: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .transform((val) => val.toUpperCase())
    .optional(),

  description: z.string().trim().max(500).optional(),

  permissionIds: z.array(z.string()).optional(),

  isActive: z.boolean().optional(),

  type: z.enum(ROLE_TYPES).optional(),
});

export type UpdateRoleSchemaType = z.infer<typeof UpdateRoleSchema>;
