import { PermissionModel } from "@hrmssuite/persistence";

import { mongoDB } from "../DB/connect.js";

const permissions = [
  // ==========================
  // EMPLOYEE
  // ==========================
  {
    key: "employee.create",
    module: "EMPLOYEE",
    action: "CREATE",
    name: "Create Employee",
  },
  {
    key: "employee.view",
    module: "EMPLOYEE",
    action: "VIEW",
    name: "View Employee",
    description: "Can view all employees in the company",
  },
  {
    key: "employee.view.hierarchy",
    module: "EMPLOYEE",
    action: "VIEW",
    name: "View Team Hierarchy",
    description:
      "Can view employees in their reporting chain (direct and indirect reports)",
  },
  {
    key: "employee.update",
    module: "EMPLOYEE",
    action: "UPDATE",
    name: "Update Employee",
    description: "Can update any employee in the company",
  },
  {
    key: "employee.update.hierarchy",
    module: "EMPLOYEE",
    action: "UPDATE",
    name: "Update Team Hierarchy",
    description:
      "Can update employees in their reporting chain (direct and indirect reports)",
  },
  {
    key: "employee.delete",
    module: "EMPLOYEE",
    action: "DELETE",
    name: "Delete Employee",
  },

  // ==========================
  // DEPARTMENT
  // ==========================
  {
    key: "department.create",
    module: "DEPARTMENT",
    action: "CREATE",
    name: "Create Department",
  },
  {
    key: "department.view",
    module: "DEPARTMENT",
    action: "VIEW",
    name: "View Department",
  },
  {
    key: "department.update",
    module: "DEPARTMENT",
    action: "UPDATE",
    name: "Update Department",
  },
  {
    key: "department.delete",
    module: "DEPARTMENT",
    action: "DELETE",
    name: "Delete Department",
  },

  // ==========================
  // DESIGNATION
  // ==========================
  {
    key: "designation.create",
    module: "DESIGNATION",
    action: "CREATE",
    name: "Create Designation",
  },
  {
    key: "designation.view",
    module: "DESIGNATION",
    action: "VIEW",
    name: "View Designation",
  },
  {
    key: "designation.update",
    module: "DESIGNATION",
    action: "UPDATE",
    name: "Update Designation",
  },
  {
    key: "designation.delete",
    module: "DESIGNATION",
    action: "DELETE",
    name: "Delete Designation",
  },

  // ==========================
  // ROLE
  // ==========================
  {
    key: "role.create",
    module: "ROLE",
    action: "CREATE",
    name: "Create Role",
  },
  {
    key: "role.view",
    module: "ROLE",
    action: "VIEW",
    name: "View Role",
  },
  {
    key: "role.update",
    module: "ROLE",
    action: "UPDATE",
    name: "Update Role",
  },
  {
    key: "role.delete",
    module: "ROLE",
    action: "DELETE",
    name: "Delete Role",
  },

  // ==========================
  // LEAVE
  // ==========================
  {
    key: "leave.create",
    module: "LEAVE",
    action: "CREATE",
    name: "Create Leave",
  },
  {
    key: "leave.view",
    module: "LEAVE",
    action: "VIEW",
    name: "View Leave",
    description: "Can view leave records for all employees in the company",
  },
  {
    key: "leave.view.hierarchy",
    module: "LEAVE",
    action: "VIEW",
    name: "View Team Leave",
    description:
      "Can view leave records for employees in their reporting chain",
  },
  {
    key: "leave.approve",
    module: "LEAVE",
    action: "APPROVE",
    name: "Approve Leave",
    description: "Can approve/reject leave for all employees in the company",
  },
  {
    key: "leave.approve.hierarchy",
    module: "LEAVE",
    action: "APPROVE",
    name: "Approve Team Leave",
    description:
      "Can approve/reject leave for employees in their reporting chain",
  },
  {
    key: "leave.reject",
    module: "LEAVE",
    action: "REJECT",
    name: "Reject Leave",
  },

  {
    key: "leave.employee.view",
    module: "LEAVE",
    action: "VIEW",
    name: "View Own Leave Records",
    description: "Employee can view only their own leave history",
  },

  // ==========================
  // ATTENDANCE
  // ==========================
  {
    key: "attendance.view",
    module: "ATTENDANCE",
    action: "VIEW",
    name: "View Attendance",
    description: "Can view attendance for all employees in the company",
  },
  {
    key: "attendance.view.hierarchy",
    module: "ATTENDANCE",
    action: "VIEW",
    name: "View Team Attendance",
    description: "Can view attendance for employees in their reporting chain",
  },
  {
    key: "attendance.update",
    module: "ATTENDANCE",
    action: "UPDATE",
    name: "Update Attendance",
  },
  {
    key: "attendance.regularization.approve",
    module: "ATTENDANCE",
    action: "APPROVE",
    name: "Approve Attendance Regularization",
  },
  {
    key: "attendance.employee.view",
    module: "ATTENDANCE",
    action: "VIEW",
    name: "View Own Attendance",
    description: "Employee can view only their own attendance records",
  },
  {
    key: "attendance.regularization.employee",
    module: "ATTENDANCE",
    action: "CREATE",
    name: "Request Attendance Regularization",
    description: "Employee can request regularization for their own attendance",
  },

  // ==========================
  // SHIFT
  // ==========================
  {
    key: "shift.create",
    module: "SHIFT",
    action: "CREATE",
    name: "Create Shift",
  },
  {
    key: "shift.view",
    module: "SHIFT",
    action: "VIEW",
    name: "View Shift",
  },
  {
    key: "shift.update",
    module: "SHIFT",
    action: "UPDATE",
    name: "Update Shift",
  },
  {
    key: "shift.delete",
    module: "SHIFT",
    action: "DELETE",
    name: "Delete Shift",
  },

  // ==========================
  // PAYROLL
  // ==========================
  {
    key: "payroll.view",
    module: "PAYROLL",
    action: "VIEW",
    name: "View Payroll",
  },
  {
    key: "payroll.process",
    module: "PAYROLL",
    action: "PROCESS",
    name: "Process Payroll",
  },

  // ==========================
  // REPORT
  // ==========================
  {
    key: "report.view",
    module: "REPORT",
    action: "VIEW",
    name: "View Reports",
  },
  {
    key: "report.export",
    module: "REPORT",
    action: "EXPORT",
    name: "Export Reports",
  },

  // ==========================
  // SETTINGS
  // ==========================
  {
    key: "settings.view",
    module: "SETTINGS",
    action: "VIEW",
    name: "View Settings",
  },
  {
    key: "settings.update",
    module: "SETTINGS",
    action: "UPDATE",
    name: "Update Settings",
  },
];

async function seed() {
  await mongoDB();

  for (const permission of permissions) {
    const exists = await PermissionModel.findOne({
      key: permission.key,
    });

    if (exists) {
      console.log(`Skipping ${permission.key} — already exists`);
      continue;
    }

    await PermissionModel.create({
      ...permission,
      isSystem: true,
      isActive: true,
    });

    console.log(`Seeded: ${permission.key}`);
  }

  console.log("Permission seeding complete");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Permission seed failed:", err);
  process.exit(1);
});
