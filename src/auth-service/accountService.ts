import bcrypt from "bcrypt";
import { Types } from "mongoose";
import { AccountsDao } from "../Dao/accounts.dao.js";
import { AccountDetails } from "@hrmssuite/persistence";

export class AccountsService {
  private accountsDao: AccountsDao;

  constructor() {
    this.accountsDao = new AccountsDao();
  }

  public createAccount = async (
    employeeId: string,
    email: string,
    createdBy: string,
    companyId: string,
  ): Promise<{ tempPassword: string }> => {
    try {
      const tempPassword = Math.random().toString(36).slice(-8).toUpperCase();

      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      await this.accountsDao.createAccount(
        {
          employee: new Types.ObjectId(employeeId),
          email,
          password: hashedPassword,
          tempPassword,
          isActive: true,
          isPasswordChanged: false,
          passwordChangedAt: null,
          meta: {
            createdBy: new Types.ObjectId(createdBy),
          },
        } as any,
        companyId,
      );

      return { tempPassword };
    } catch (error) {
      throw error;
    }
  };

  public deactivateAccount = async (
    employeeId: string,
    companyId: string,
  ): Promise<void> => {
    try {
      await this.accountsDao.deactivateAccount(
        new Types.ObjectId(employeeId),
        companyId,
      );
    } catch (error) {
      throw error;
    }
  };
  public activateAccount = async (
    employeeId: string,
    companyId: string,
  ): Promise<void> => {
    try {
      await this.accountsDao.activateAccount(
        new Types.ObjectId(employeeId),
        companyId,
      );
    } catch (error) {
      throw error;
    }
  };

  public deleteAccount = async (
    employeeId: string,
    companyId: string,
  ): Promise<void> => {
    try {
      await this.accountsDao.deleteAccount(employeeId, companyId);
    } catch (error) {
      throw error;
    }
  };

  public findAllAccount = async (
    companyId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      roleId?: string;
      employeeId?: string;
    } = {},
  ) => {
    try {
      const page = Math.max(Number(params.page) || 1, 1);
      const limit = Math.max(Number(params.limit) || 10, 1);

      const result = await this.accountsDao.getAllAccount(companyId, {
        page,
        limit,
        search: params.search,
        roleId: params.roleId,
        employeeId: params.employeeId,
      });

      return {
        data: result.data,

        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  };
}
