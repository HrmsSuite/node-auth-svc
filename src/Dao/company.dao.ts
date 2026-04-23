import { Company, CompanyModel } from "@hrmssuite/persistence";
import { Apperror } from "../common/utils/error.js";

export class Company_Dao {
  public async createCompany(data: Company): Promise<Company> {
    try {
      const created = await CompanyModel.create(data);
      return created;
    } catch (err: any) {
      throw new Apperror("Something went wrong", 401);
    }
  }

  public async deleteCompany(id: string): Promise<Company> {
    try {
      const deleted = await CompanyModel.findByIdAndDelete(id);
      if (!deleted) {
        throw new Apperror("Company not found", 404);
      }
      return deleted;
    } catch (err) {
      if (err instanceof Apperror) throw err;
      throw new Apperror("Something went wrong", 500);
    }
  }
  public async getCompanyById(id: string): Promise<Company> {
    try {
      const company = await CompanyModel.findById(id)
        .select("-password")
        .lean();
      if (!company) {
        throw new Apperror("Company not found", 404);
      }
      return company;
    } catch (err) {
      if (err instanceof Apperror) throw err;
      throw new Apperror("Failed to fetch company", 500);
    }
  }
}
