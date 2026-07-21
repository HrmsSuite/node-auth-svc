import { z } from "zod";
import { ROLE_TYPES, PERMISSIONS, Permission } from "@hrmssuite/persistence";

export const CreateRoleSchema = z.object({
  name: z.string().trim().min(2, "Role name is required").max(100),

  code: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .transform((val) => val.toUpperCase()),

  description: z.string().trim().max(500).optional(),

  type: z.enum(ROLE_TYPES).default("CUSTOM"),

  permissionIds: z.array(z.string()).default([]),

  isDefault: z.boolean().optional().default(false),

  isActive: z.boolean().optional().default(true),
});

export type CreateRoleSchemaType = z.infer<typeof CreateRoleSchema>;
