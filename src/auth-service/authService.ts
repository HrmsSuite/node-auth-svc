import { AccountsModel, CompanyModel } from "@hrmssuite/persistence";
import { Apperror } from "../common/utils/error.js";
import { ReHashPassword } from "../common/utils/password.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../common/utils/jwt.js";
import { Company_Dao } from "../Dao/company.dao.js";
import { AccountsDao } from "../Dao/accounts.dao.js"; 

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  role: "admin" | "employee";
  companyId: string;
  isPasswordChanged?: boolean;
  employeeId?: string;
}

export class Auth_Services {
  private companyDao = new Company_Dao();
  private AccountDao = new AccountsDao();
  public async login(email: string, password: string): Promise<LoginResult> {
    // Company Login
    const company = await CompanyModel.findOne({ email });

    if (company) {
      const isMatch = await ReHashPassword(password, company.password);
      if (!isMatch) {
        throw new Apperror("Invalid email or password", 401);
      }

      const payload = {
        id: company._id.toString(),
        companyId: company._id.toString(),
        role: "admin",
      };

      const accessToken = signAccessToken(payload);
      const refreshToken = signRefreshToken(payload);

      return {
        accessToken,
        refreshToken,
        role: "admin",
        companyId: company._id.toString(),
      };
    }

    // Employee Login
    const account = await AccountsModel.findOne({ email });

    if (!account) {
      throw new Apperror("Invalid email or password", 401);
    }

    if (!account.isActive) {
      throw new Apperror("Account deactivated. Contact admin.", 403);
    }

    const isMatch = await ReHashPassword(password, account.password);
    if (!isMatch) {
      throw new Apperror("Invalid email or password", 401);
    }

    const payload = {
      id: account._id.toString(),
      companyId: account.companyId.toString(),
      role: "employee",
      employeeId: account.employee.toString(), 
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      role: "employee",
      isPasswordChanged: account.isPasswordChanged,
      companyId: account.companyId.toString(),
      employeeId: account.employee.toString(),
    };
  }

  public async refresh(token: string) {
    try {
      const payload = verifyRefreshToken(token);

      // ── Admin check ──
      const company = await CompanyModel.findById(payload.id);
      if (company) {
        const newPayload = {
          id: company._id.toString(),
          companyId: company._id.toString(),
          role: "admin",
        };
        return { accessToken: signAccessToken(newPayload) };
      }

      // ── Employee check ──
      const account = await AccountsModel.findById(payload.id);
      if (!account) {
        throw new Apperror("Account not found", 404);
      }

      const newPayload = {
        id: account._id.toString(),
        companyId: account.companyId.toString(),
        employeeId: account.employee.toString(),
        role: "employee",
      };
      return { accessToken: signAccessToken(newPayload) };
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

  public async findAccountById(id: string) {
    try {
      const account = await AccountsModel.findById(id).populate("employee");
      if (!account) {
        throw new Apperror("Employee account not found", 404);
      }
      return account;
    } catch (error) {
      if (error instanceof Apperror) throw error;
      throw new Apperror("Failed to fetch employee account", 500);
    }
  }
}
