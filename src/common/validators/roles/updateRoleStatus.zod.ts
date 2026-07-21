import { z } from "zod";

export const UpdateRoleStatusSchema = z.object({
  isActive: z.boolean(),
});

export type UpdateRoleStatusSchemaType = z.infer<typeof UpdateRoleStatusSchema>;
