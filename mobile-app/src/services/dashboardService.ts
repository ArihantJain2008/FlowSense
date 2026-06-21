import { api } from "./api";

export const getBudgetSummary =
  async () => {
    const response =
      await api.get(
        "/budgets/summary"
      );

    return response.data;
  };

export const getExpenses =
  async () => {
    const response =
      await api.get(
        "/expenses"
      );

    return response.data;
  };

export const getAnalytics =
  async () => {
    const response =
      await api.get(
        "/expenses/analytics"
      );

    return response.data;
  };