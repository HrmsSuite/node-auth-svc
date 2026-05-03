import { AccountDetails, AccountsModel } from "@hrmssuite/persistence";
import { Apperror } from "../common/utils/error.js";
import { Types } from "mongoose";

export class AccountsDao {
  public createAccount = async (
    data: AccountDetails,
  ): Promise<AccountDetails> => {
    try {
      const created = await AccountsModel.create(data);
      return created;
    } catch (error: any) {
      throw new Apperror("Something went wrong", 500); // 
    }
  };

  public deactivateAccount = async (
    employeeId: Types.ObjectId,
  ): Promise<AccountDetails> => {
    try {
      const deactivated = await AccountsModel.findOneAndUpdate(
        { employee: employeeId },
        { isActive: false },
        { new: true },
      );
      if (!deactivated) {
        throw new Apperror("Account not found", 404); // 
      }
      return deactivated;
    } catch (error: any) {
      throw new Apperror("Something went wrong", 500); // 
    }
  };
  public activateAccount = async (
    employeeId: Types.ObjectId,
  ): Promise<AccountDetails> => {
    try {
      const activated = await AccountsModel.findOneAndUpdate(
        { employee: employeeId },
        { isActive: true },
        { new: true },
      );
      if (!activated) {
        throw new Apperror("Account not found", 404); // 
      }
      return activated;
    } catch (error: any) {
      throw new Apperror("Something went wrong", 500); // 
    }
  };

  public deleteAccount = async (
    employeeId: string,
  ): Promise<AccountDetails> => {
    try {
      const deleted = await AccountsModel.findOneAndDelete({
        employee: employeeId,
      });
      if (!deleted) {
        throw new Apperror("Account not found", 404); // 
      }
      return deleted;
    } catch (error: any) {
      throw new Apperror("Something went wrong", 500); // 
    }
  };

  public getAllAccount = async (): Promise<AccountDetails[]> => {
    try {
      const getAll = await AccountsModel.find()
        .lean()
        .populate("employee", "data.basic.firstName data.basic.lastName data.basic.email data.basic.phone job");
      return getAll;
    } catch (error: any) {
      throw new Apperror("Something went wrong", 500); // 
    }
  };
}