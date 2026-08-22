import {
  AccountDetails,
  AccountsModel,
  EmployeeModel,
} from "@hrmssuite/persistence";
import { Apperror } from "../common/utils/error.js";
import { Types } from "mongoose";

export class AccountsDao {
  public createAccount = async (
    data: AccountDetails,
    companyId: string,
  ): Promise<AccountDetails> => {
    try {
      const created = await AccountsModel.create({ ...data, companyId });
      return created;
    } catch (error: any) {
      throw new Apperror("Something went wrong", 500); //
    }
  };

  public deactivateAccount = async (
    employeeId: Types.ObjectId,
    companyId: string,
  ): Promise<AccountDetails> => {
    try {
      const deactivated = await AccountsModel.findOneAndUpdate(
        { employee: employeeId, companyId },
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
    companyId: string,
  ): Promise<AccountDetails> => {
    try {
      const activated = await AccountsModel.findOneAndUpdate(
        { employee: employeeId, companyId },
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
    companyId: string,
  ): Promise<AccountDetails> => {
    try {
      const deleted = await AccountsModel.findOneAndDelete({
        employee: employeeId,
        companyId,
      });
      if (!deleted) {
        throw new Apperror("Account not found", 404); //
      }
      return deleted;
    } catch (error: any) {
      throw new Apperror("Something went wrong", 500); //
    }
  };

  public getAllAccount = async (
    companyId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      roleId?: string;
      employeeId?: string;
    } = {},
  ): Promise<{
    data: AccountDetails[];
    total: number;
  }> => {
    try {
      const page = Math.max(Number(params.page) || 1, 1);
      const limit = Math.min(Math.max(Number(params.limit) || 10, 1), 100);

      const skip = (page - 1) * limit;

      const employeeFilter: Record<string, any> = {
        companyId: new Types.ObjectId(companyId),
      };

      if (params.employeeId) {
        if (!Types.ObjectId.isValid(params.employeeId)) {
          throw new Apperror("Invalid employee ID", 400);
        }

        employeeFilter._id = new Types.ObjectId(params.employeeId);
      }

      if (params.roleId) {
        if (!Types.ObjectId.isValid(params.roleId)) {
          throw new Apperror("Invalid role ID", 400);
        }

        employeeFilter["data.job.roleIds"] = new Types.ObjectId(params.roleId);
      }

      if (params.search?.trim()) {
        const searchValue = params.search.trim();

        employeeFilter.$or = [
          {
            "data.basic.firstName": {
              $regex: searchValue,
              $options: "i",
            },
          },
          {
            "data.basic.lastName": {
              $regex: searchValue,
              $options: "i",
            },
          },
          {
            "data.basic.email": {
              $regex: searchValue,
              $options: "i",
            },
          },
          {
            "data.basic.phone": {
              $regex: searchValue,
              $options: "i",
            },
          },
          {
            "data.basic.employeeId": {
              $regex: searchValue,
              $options: "i",
            },
          },
        ];
      }

      const employees = await EmployeeModel.find(employeeFilter)
        .select("_id")
        .lean();

      const employeeIds = employees.map((employee) => employee._id);

      if (!employeeIds.length) {
        return {
          data: [],
          total: 0,
        };
      }

      const accountFilter = {
        companyId: new Types.ObjectId(companyId),
        employee: {
          $in: employeeIds,
        },
      };

      const [data, total] = await Promise.all([
        AccountsModel.find(accountFilter)
          .sort({ createdAt: -1, _id: -1 })
          .skip(skip)
          .limit(limit)
          .populate({
            path: "employee",
            select:
              "data.basic.firstName data.basic.lastName data.basic.email data.basic.phone data.basic.employeeId data.job.roleIds",
            populate: {
              path: "data.job.roleIds",
              select: "name code type",
            },
          })
          .lean(),

        AccountsModel.countDocuments(accountFilter),
      ]);

      return {
        data: data as AccountDetails[],
        total,
      };
    } catch (error: any) {
      if (error instanceof Apperror) {
        throw error;
      }

      throw new Apperror(error?.message || "Something went wrong", 500);
    }
  };
}
