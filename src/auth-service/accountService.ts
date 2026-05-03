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

      await this.accountsDao.createAccount({ 
        employee: new Types.ObjectId(employeeId),
        email,
        password: hashedPassword,
        tempPassword, 
        isActive: true,
        role: "employee",
        isPasswordChanged: false,
        passwordChangedAt: null,
        meta: {
          createdBy: new Types.ObjectId(createdBy),
        },
      } as any,companyId);

      return { tempPassword };
    } catch (error) {
      throw error;
    }
  };

  public deactivateAccount = async (employeeId: string,companyId:string): Promise<void> => {
    try {
      await this.accountsDao.deactivateAccount(new Types.ObjectId(employeeId),companyId);
    } catch (error) {
      throw error;
    }
  };
  public activateAccount = async (employeeId: string,companyId:string): Promise<void> => {
    try {
      await this.accountsDao.activateAccount(new Types.ObjectId(employeeId),companyId);
    } catch (error) {
      throw error;
    }
  };

  public deleteAccount = async (employeeId: string,companyId:string): Promise<void> => {
    try {
      await this.accountsDao.deleteAccount(employeeId,companyId);
    } catch (error) {
      throw error;
    }
  };

  public findAllAccount = async(companyId:string):Promise<AccountDetails[]> => {
    try {
        const res = await this.accountsDao.getAllAccount(companyId);
        return res
    } catch (error) {
        throw error
    }
  }
}
