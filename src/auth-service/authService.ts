import {
  AccountsModel,
  CompanyModel,
  EmployeeModel,
} from "@hrmssuite/persistence";

import { Apperror } from "../common/utils/error.js";
import { ReHashPassword } from "../common/utils/password.js";

import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../common/utils/jwt.js";

import { Company_Dao } from "../Dao/company.dao.js";
import { Payload } from "../typings/payload.typings.js";

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

  private async getEmployeeRBAC(employeeId: string, companyId: string) {
    const employee = await EmployeeModel.findById(employeeId);

    if (!employee) {
      throw new Apperror("Employee profile not found", 404);
    }

    const roleIds = employee.data.job.roleIds?.map((id) => id.toString()) ?? [];

    return {
      roleIds,
    };
  }

  public async login(email: string, password: string): Promise<LoginResult> {
    // ==========================
    // COMPANY ADMIN LOGIN
    // ==========================

    const company = await CompanyModel.findOne({
      email,
    });

    if (company) {
      const isMatch = await ReHashPassword(password, company.password);

      if (!isMatch) {
        throw new Apperror("Invalid email or password", 401);
      }

      const payload: Payload = {
        id: company._id.toString(),
        companyId: company._id.toString(),
        role: "admin",
      };

      return {
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload),
        role: "admin",
        companyId: company._id.toString(),
      };
    }

    // ==========================
    // EMPLOYEE LOGIN
    // ==========================

    const account = await AccountsModel.findOne({
      email,
    });

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

    const { roleIds } = await this.getEmployeeRBAC(
      account.employee.toString(),
      account.companyId.toString(),
    );

    const payload: Payload = {
      id: account._id.toString(),

      companyId: account.companyId.toString(),

      role: "employee",

      employeeId: account.employee.toString(),

      roleIds,
    };

    return {
      accessToken: signAccessToken(payload),

      refreshToken: signRefreshToken(payload),

      role: "employee",

      companyId: account.companyId.toString(),

      employeeId: account.employee.toString(),

      isPasswordChanged: account.isPasswordChanged,
    };
  }

  public async refresh(token: string) {
    try {
      const payload = verifyRefreshToken(token);

      // ==========================
      // ADMIN REFRESH
      // ==========================

      if (payload.role === "admin") {
        const newPayload: Payload = {
          id: payload.id,

          companyId: payload.companyId,

          role: "admin",
        };

        return {
          accessToken: signAccessToken(newPayload),
        };
      }

      // ==========================
      // EMPLOYEE REFRESH
      // ==========================

      if (payload.role === "employee") {
        const account = await AccountsModel.findById(payload.id);

        if (!account) {
          throw new Apperror("Account not found", 404);
        }

        const { roleIds } = await this.getEmployeeRBAC(
          account.employee.toString(),
          account.companyId.toString(),
        );

        const newPayload: Payload = {
          id: account._id.toString(),

          companyId: account.companyId.toString(),

          employeeId: account.employee.toString(),

          role: "employee",

          roleIds,
        };

        return {
          accessToken: signAccessToken(newPayload),
        };
      }

      throw new Apperror("Invalid token role", 401);
    } catch (err) {
      if (err instanceof Apperror) {
        throw err;
      }

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
