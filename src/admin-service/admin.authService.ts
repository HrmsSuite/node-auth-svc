import { Company } from "@hrmssuite/persistence";
import { Company_Dao } from "../Dao/company.dao.js";
import { Hashpassword } from "../common/utils/password.js";
import { Apperror } from "../common/utils/error.js";

export class create {
  private company: Company_Dao;
  constructor(company: Company_Dao) {
    this.company = company;
  }
  public create_Company = async (data: Company, adminID: string) => {
    if (!adminID) {
      throw new Apperror("Unauthorized: admin ID missing", 401);
    }

    if (data.password) {
      data.password = await Hashpassword(data.password);
    }

    const company = await this.company.createCompany(data);
    return company;
  };
}