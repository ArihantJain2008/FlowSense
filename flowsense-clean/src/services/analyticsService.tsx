import { getAnalytics } from "./dashboardService";

export const fetchAnalytics = async (
  params?: Record<string, string | number | undefined>
) => {
  return await getAnalytics(params);
};
