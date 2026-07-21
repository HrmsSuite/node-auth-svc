import { z } from "zod";
import { PERMISSION_ACTIONS, PERMISSION_MODULES } from "@hrmssuite/persistence";

export const CreatePermissionValidator = z.object({
  key: z.string().trim().min(3),

  module: z.enum(PERMISSION_MODULES),

  action: z.enum(PERMISSION_ACTIONS),

  name: z.string().trim().min(2),

  description: z.string().optional(),

  isSystem: z.boolean().optional(),

  isActive: z.boolean().optional(),
});

export const UpdatePermissionValidator = CreatePermissionValidator.partial();

export type CreatePermissionInput = z.infer<typeof CreatePermissionValidator>;

export type UpdatePermissionInput = z.infer<typeof UpdatePermissionValidator>;
