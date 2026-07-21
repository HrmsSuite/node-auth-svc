import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Role_Service } from "../auth-service/role.service.js";
import { RoleFiltersSchema } from "../common/validators/roles/roleFilters.zod.js";
import { UpdateRoleSchema } from "../common/validators/roles/updateRole.zod.js";
import { UpdateRoleStatusSchema } from "../common/validators/roles/updateRoleStatus.zod.js";
import { CreateRoleSchema } from "../common/validators/roles/createRole.zod.js";

const handleZodError = (error: ZodError, res: Response): void => {
  res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    })),
  });
};

export class RoleController {
  private roleService: Role_Service;

  constructor() {
    this.roleService = new Role_Service();
  }

  /**
   * POST /roles
   *
   * Creates a new role for the authenticated company.
   *
   * The payload is validated against `CreateRoleSchema` before the service is
   * invoked. The service additionally guards against duplicate role
   * name/code within the company.
   *
   * @param req  - Express request. Expects `req.companyId` (set by auth
   *               middleware), optionally `req.user.id`, and a role payload
   *               in `req.body`.
   * @param res  - Express response.
   *               201 – role created, body contains the new document.
   *               400 – Zod validation error, body lists field-level issues.
   * @param next - Express next function. Called on unexpected errors
   *               (including duplicate-name/code conflicts from the service).
   * @returns    Promise<void>
   */
  public async createRole(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const companyId = req.companyId as string;
      const userId = req.user?.id as string;

      const data = CreateRoleSchema.parse(req.body);

      const createdRole = await this.roleService.createRole(
        companyId,
        userId,
        data,
      );

      res.status(201).json({
        success: true,
        message: "Role created successfully",
        data: createdRole,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(error, res);
        return;
      }
      next(error);
    }
  }

  /**
   * GET /roles
   *
   * Returns a paginated, filterable list of roles belonging to the
   * authenticated company. All query parameters are optional.
   *
   * Supported query params:
   * - `page`     {number}  1-based page number (default: 1, min: 1)
   * - `limit`    {number}  Page size (default: 10, min: 1, max: 100)
   * - `search`   {string}  Case-insensitive match on name / code / description
   * - `isActive` {boolean} Filters by active status
   * - `type`     {string}  "SYSTEM" | "CUSTOM"
   *
   * Query params are validated and coerced by `RoleFiltersSchema` before
   * being passed to the service.
   *
   * @param req  - Express request. Expects `req.companyId` and optional
   *               query params.
   * @param res  - Express response.
   *               200 – paginated result containing roles array and
   *                     pagination metadata.
   *               400 – Zod validation error on query params.
   * @param next - Express next function. Called on unexpected errors.
   * @returns    Promise<void>
   */
  public async findAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const companyId = req.companyId as string;

      const filters = RoleFiltersSchema.parse(req.query);

      const result = await this.roleService.getRoles(companyId, filters);

      res.status(200).json({
        success: true,
        message: "Roles fetched successfully",
        data: result,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(error, res);
        return;
      }
      next(error);
    }
  }

  /**
   * GET /roles/:id
   *
   * Fetches a single role by its MongoDB ObjectId within the authenticated
   * company.
   *
   * @param req  - Express request. Expects `req.params.id` (MongoDB
   *               ObjectId string) and `req.companyId`.
   * @param res  - Express response.
   *               200 – role document.
   *               400 – missing id param.
   * @param next - Express next function. Called on unexpected errors
   *               (including role-not-found errors from the service).
   * @returns    Promise<void>
   */
  public async findById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const companyId = req.companyId as string;

      if (!id) {
        res.status(400).json({ success: false, message: "ID is required" });
        return;
      }

      const role = await this.roleService.getRoleById(companyId, id);

      res.status(200).json({
        success: true,
        message: "Role fetched successfully",
        data: role,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /roles/:id
   *
   * Partially updates a role (patch semantics — only fields present in
   * `req.body` are modified). System roles cannot be modified; the service
   * rejects such attempts. When name/code are changed, the service guards
   * against duplicates within the company.
   *
   * The payload is validated against `UpdateRoleSchema` before the service
   * is invoked.
   *
   * @param req  - Express request. Expects `req.params.id` (MongoDB
   *               ObjectId), `req.companyId`, and a partial role payload in
   *               `req.body`.
   * @param res  - Express response.
   *               200 – updated role document.
   *               400 – missing id param or Zod validation error.
   * @param next - Express next function. Called on unexpected errors
   *               (including system-role and duplicate-name/code conflicts
   *               from the service).
   * @returns    Promise<void>
   */
  public async updateRole(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const companyId = req.companyId as string;

      if (!id) {
        res.status(400).json({ success: false, message: "ID is required" });
        return;
      }

      const data = UpdateRoleSchema.parse(req.body);

      const updatedRole = await this.roleService.editRole(companyId, id, data);

      res.status(200).json({
        success: true,
        message: "Role updated successfully",
        data: updatedRole,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(error, res);
        return;
      }
      next(error);
    }
  }

  /**
   * PATCH /roles/:id/status
   *
   * Activates or deactivates a role. Deactivating a role that is currently
   * assigned to one or more employees is rejected by the service.
   *
   * The payload is validated against `UpdateRoleStatusSchema` before the
   * service is invoked.
   *
   * @param req  - Express request. Expects `req.params.id` (MongoDB
   *               ObjectId), `req.companyId`, and `{ isActive: boolean }` in
   *               `req.body`.
   * @param res  - Express response.
   *               200 – updated role document.
   *               400 – missing id param or Zod validation error.
   * @param next - Express next function. Called on unexpected errors
   *               (including role-assigned conflicts from the service).
   * @returns    Promise<void>
   */
  public async updateRoleStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const companyId = req.companyId as string;

      if (!id) {
        res.status(400).json({ success: false, message: "ID is required" });
        return;
      }

      const { isActive } = UpdateRoleStatusSchema.parse(req.body);

      const updatedRole = await this.roleService.updateRoleStatus(
        companyId,
        id,
        isActive,
      );

      res.status(200).json({
        success: true,
        message: "Role status updated successfully",
        data: updatedRole,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(error, res);
        return;
      }
      next(error);
    }
  }

  /**
   * DELETE /roles/:id
   *
   * Soft-deletes a role. System roles cannot be deleted, and roles that are
   * currently assigned to one or more employees are rejected by the service
   * until those employees are reassigned.
   *
   * @param req  - Express request. Expects `req.params.id` (MongoDB
   *               ObjectId), `req.companyId`, and optionally `req.user.id`
   *               for the audit trail.
   * @param res  - Express response.
   *               200 – deletion acknowledged.
   *               400 – missing id param.
   * @param next - Express next function. Called on unexpected errors
   *               (including system-role and role-assigned conflicts from
   *               the service).
   * @returns    Promise<void>
   */
  public async deleteRole(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const companyId = req.companyId as string;
      const userId = req.user?.id as string;

      if (!id) {
        res.status(400).json({ success: false, message: "ID is required" });
        return;
      }

      await this.roleService.deleteRole(companyId, id, userId);

      res.status(200).json({
        success: true,
        message: "Role deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
