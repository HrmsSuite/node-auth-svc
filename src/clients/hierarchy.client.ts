import axios from "axios";

export class HierarchyClient {
  private readonly employeeSvc = process.env.EMPLOYEE_SVC_URL!;

  async getReports(employeeId: string, token: string): Promise<string[]> {
    const res = await axios.get(
      `${this.employeeSvc}/api/v1/internal/hierarchy/reports/${employeeId}`,
      {
        headers: {
          Authorization: token,
        },
      },
    );

    return res.data.data;
  }
}

export const hierarchyClient = new HierarchyClient();
