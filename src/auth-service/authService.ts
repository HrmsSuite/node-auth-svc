import { CompanyModel } from "@hrmssuite/persistence";
import { Apperror } from "../common/utils/error.js";
import { ReHashPassword } from "../common/utils/password.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../common/utils/jwt.js";
import { Company_Dao } from "../Dao/company.dao.js";

export class Auth_Services {
  private companyDao = new Company_Dao();
  public async login(email: string, password: string) {
    const company = await CompanyModel.findOne({ email });

    if (!company) {
      throw new Apperror("Invalid email or password", 401);
    }

    const isMatch = await ReHashPassword(password, company.password);

    if (!isMatch) {
      throw new Apperror("Invalid email or password", 401);
    }

    const payload = {
      id: company._id.toString(),
      companyId: company._id.toString(),
      role: "company",
    };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return { accessToken, refreshToken, companyId: company._id.toString() };
  }
  public async refresh(token: string) {
    try {
      const payload = verifyRefreshToken(token);
      const company = await CompanyModel.findById(payload.id);

      if (!company) {
        throw new Apperror("Company not found", 404);
      }

      const newPayload = {
        id: company._id.toString(),
        companyId: company._id.toString(),
        role: "company",
      };
      const accessToken = signAccessToken(newPayload);

      return { accessToken };
    } catch (err) {
      if (err instanceof Apperror) throw err;
      throw new Apperror("Invalid or expired refresh token", 401);
    }
  }
  public async findCompanyById(id: string) {
    try {
      const company = await this.companyDao.getCompanyById(id);
      if (!company) {
        throw new Apperror("Company not found", 404);
      }
      return company;
    } catch (error) {
      if (error instanceof Apperror) throw error;
      throw new Apperror("Failed to fetch company", 500);
    }
  }
}
