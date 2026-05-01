import { Company } from "@hrmssuite/persistence";
import { Company_Dao } from "../Dao/company.dao.js";
import {
  CompanyIdSchema,
  UpdateCompanySchema,
  UpdateCompanySchemaType,
} from "../common/validators/company.zod.js";
import { Apperror } from "../common/utils/error.js";

export class CompanyServices {
  private companyService: Company_Dao;

  constructor() {
    this.companyService = new Company_Dao();
  }

  public async EditCompanyServices(
    id: string,
    data: UpdateCompanySchemaType
  ): Promise<Company> {
    try {
      CompanyIdSchema.parse(id);

      const validation = UpdateCompanySchema.safeParse(data);

      if (!validation.success) {
        throw new Apperror(
          validation.error.issues[0]?.message || "Validation failed",
          400
        );
      }

      const updatedCompany = await this.companyService.EditCompany(
        id,
        validation.data
      );

      return updatedCompany;
    } catch (error) {
      if (error instanceof Apperror) {
        throw error;
      }

      throw new Apperror("Something went wrong", 500);
    }
  }
}