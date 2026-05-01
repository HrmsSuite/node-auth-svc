import { Company, CompanyModel } from "@hrmssuite/persistence";
import { Apperror } from "../common/utils/error.js";
import { UpdateCompanySchemaType } from "../common/validators/company.zod.js";

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

  public async EditCompany(
    id: string,
    data: UpdateCompanySchemaType,
  ): Promise<Company> {
    try {
      const setFields: Record<string, any> = {};

      // Basic
      if (data.basic !== undefined) {
        Object.entries(data.basic).forEach(([key, value]) => {
          if (value !== undefined) {
            setFields[key] = value;
          }
        });
      }

      // Address
      if (data.address !== undefined) {
        Object.entries(data.address).forEach(([key, value]) => {
          if (value !== undefined) {
            setFields[`address.${key}`] = value;
          }
        });
      }

      // Status
      if (data.status !== undefined) {
        Object.entries(data.status).forEach(([key, value]) => {
          if (value !== undefined) {
            setFields[key] = value;
          }
        });
      }

      // Payroll Settings
      if (data.payrollSettings !== undefined) {
        Object.entries(data.payrollSettings).forEach(([key, value]) => {
          if (value !== undefined) {
            setFields[`payrollSettings.${key}`] = value;
          }
        });
      }

      // Leave Policy
      if (data.leavePolicy !== undefined) {
        Object.entries(data.leavePolicy).forEach(([key, value]) => {
          if (value !== undefined) {
            setFields[`leavePolicy.${key}`] = value;
          }
        });
      }

      // Working Hours
      if (data.workingHours !== undefined) {
        Object.entries(data.workingHours).forEach(([key, value]) => {
          if (value !== undefined) {
            setFields[`workingHours.${key}`] = value;
          }
        });
      }

      // Working Days
      if (data.workingDays !== undefined) {
        setFields["workingDays"] = data.workingDays;
      }

      // Meta
      if (data.meta !== undefined) {
        Object.entries(data.meta).forEach(([key, value]) => {
          if (value !== undefined) {
            setFields[`meta.${key}`] = value;
          }
        });
      }

      const updatedCompany = await CompanyModel.findOneAndUpdate(
        {
          _id: id,
          "meta.isDeleted": { $ne: true },
        },
        { $set: setFields },
        {
          new: true,
          runValidators: true,
        },
      );

      if (!updatedCompany) {
        throw new Apperror("Company not found", 404);
      }

      return updatedCompany;
    } catch (err) {
      if (err instanceof Apperror) throw err;
      throw new Apperror("Failed to update company", 500);
    }
  }
}
