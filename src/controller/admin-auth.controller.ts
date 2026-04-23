import { NextFunction, Request, Response } from "express";
import { Apperror } from "../common/utils/error.js";
import { Auth_Services } from "../auth-service/index.js";

const authService = new Auth_Services();

export class AdminController {
  public async adminController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new Apperror("Email and password are required", 400);
      }

      const authLogin = await authService.login(email, password);

      return res.status(200).json({
        message: "Login successful",
        accessToken: authLogin.accessToken,
        refreshToken: authLogin.refreshToken,
        companyId: authLogin.companyId,
      });
    } catch (error) {
      next(error);
    }
  }
  public async refreshController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new Apperror("Refresh token is required", 400);
      }

      const result = await authService.refresh(refreshToken);

      return res.status(200).json({
        message: "Token refreshed",
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }
  public async getCompanyDataById(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req?.companyId;
      if (!userId) {
        throw new Apperror("Unauthorized", 401);
      }
      const data = await authService.findCompanyById(userId);
      return res
        .status(200)
        .json({ data: data, message: "Data get Successfully" });
    } catch (error) {
      next(error);
    }
  }
}
