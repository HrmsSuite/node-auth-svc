import { NextFunction, Request, Response } from "express";
import { AccountsService } from "../auth-service/accountService.js";
import { Apperror } from "../common/utils/error.js";
import { AccountDetails } from "@hrmssuite/persistence";
export class AccountsController {
  private accountsService: AccountsService;

  constructor() {
    this.accountsService = new AccountsService();
  }

  public createAccount = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { employeeId, email } = req.body;
      const createdBy = req.user?.id as string;

      const { tempPassword } = await this.accountsService.createAccount(
        employeeId,
        email,
        createdBy,
      );

      res.status(201).json({
        success: true,
        message: "Account created successfully",
        data: { tempPassword },
      });
    } catch (error) {
      next(error);
    }
  };

  public deactivateAccount = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const employeeId = req.params.employeeId as string;
      if (!employeeId) {
        throw new Apperror("Unauthorized", 401);
      }
      await this.accountsService.deactivateAccount(employeeId);
      res.status(200).json({
        success: true,
        message: "Account deactivated successfully",
      });
    } catch (error) {
      next(error);
    }
  };
  public activateAccount = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const employeeId = req.params.employeeId as string;
      if (!employeeId) {
        throw new Apperror("Unauthorized", 401);
      }
      await this.accountsService.activateAccount(employeeId);
      res.status(200).json({
        success: true,
        message: "Account activated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteAccount = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const employeeId = req.params.employeeId as string;
      if (!employeeId) {
        throw new Apperror("Unauthorized", 401);
      }
      await this.accountsService.deleteAccount(employeeId);
      res.status(200).json({
        success: true,
        message: "Account deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
  public allAccount = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const accounts = await this.accountsService.findAllAccount();
      res.status(200).json({
        success: true,
        message: "Accounts fetched successfully",
        data: accounts,
      });
    } catch (error) {
      next(error);
    }
  };
}
