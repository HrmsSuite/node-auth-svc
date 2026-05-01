import { z } from "zod";

/*  Basic Info  */
export const CompanyBasicSchema = z.object({
  name: z.string().trim().min(1, "Company name is required"),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),

  phone: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  companySize: z.string().trim().optional(),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
});

/*  Address  */
export const CompanyAddressSchema = z.object({
  street: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
});

/*  Status  */
export const CompanyStatusSchema = z.object({
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});

/*  Payroll  */
export const PayrollSettingsSchema = z.object({
  currency: z.string().trim().optional(),

  payrollCycle: z
    .enum(["Monthly", "Bi-weekly"])
    .optional(),

  payDayOfMonth: z
    .number()
    .min(1)
    .max(31)
    .optional(),
});

/*  Leave Policy  */
export const LeavePolicySchema = z.object({
  annualLeave: z.number().min(0).optional(),
  sickLeave: z.number().min(0).optional(),
  casualLeave: z.number().min(0).optional(),
});

/*  Working Hours  */
export const WorkingHoursSchema = z.object({
  start: z.string().optional(),
  end: z.string().optional(),
});

/*  Meta  */
export const CompanyMetaSchema = z.object({
  version: z.number().optional(),
  isDeleted: z.boolean().optional(),
});

/*  Create Company  */
export const CompanySchema = z.object({
  basic: CompanyBasicSchema,

  address: CompanyAddressSchema.optional(),

  status: CompanyStatusSchema.optional(),

  payrollSettings: PayrollSettingsSchema.optional(),

  leavePolicy: LeavePolicySchema.optional(),

  workingDays: z.array(z.string()).optional(),

  workingHours: WorkingHoursSchema.optional(),

  meta: CompanyMetaSchema.optional(),
});

/*  Update Company  */
export const UpdateCompanySchema = z.object({
  basic: CompanyBasicSchema.partial().optional(),

  address: CompanyAddressSchema.partial().optional(),

  status: CompanyStatusSchema.partial().optional(),

  payrollSettings: PayrollSettingsSchema.partial().optional(),

  leavePolicy: LeavePolicySchema.partial().optional(),

  workingDays: z.array(z.string()).optional(),

  workingHours: WorkingHoursSchema.partial().optional(),

  meta: CompanyMetaSchema.partial().optional(),
});

/*  Helpers  */
export const CompanyIdSchema = z.string().min(1, "Company ID is required");

/*  Types  */
export type CompanySchemaType = z.infer<typeof CompanySchema>;

export type UpdateCompanySchemaType = z.infer<
  typeof UpdateCompanySchema
>;