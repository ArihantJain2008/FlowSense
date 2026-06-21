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

export const getCurrentBudget =
  async () => {
    const response =
      await api.get(
        "/budgets/current"
      );

    return response.data;
  };

export const setCurrentBudget =
  async (amount: number) => {
    const response =
      await api.post("/budgets", {
        amount,
      });

    return response.data;
  };
