import { getAnalytics } from "./dashboardService";

export const fetchAnalytics =
  async () => {
    return await getAnalytics();
  };