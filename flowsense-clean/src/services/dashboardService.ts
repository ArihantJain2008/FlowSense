import { api } from "./api";

export const getBudgetSummary = async (
  params?: Record<string, string | number | undefined>
) => {
  const response = await api.get("/budgets/summary", {
    params,
  });

  return response.data;
};

export const getExpenses = async (
  params?: Record<string, string | number | undefined>
) => {
  const response = await api.get("/expenses", {
    params,
  });

  return response.data;
};

export const getAnalytics = async (
  params?: Record<string, string | number | undefined>
) => {
  const response = await api.get("/expenses/analytics", {
    params,
  });

  return response.data;
};

export const getOverview = async (
  params?: Record<string, string | number | undefined>
) => {
  const response = await api.get("/insights/overview", {
    params,
  });

  return response.data;
};

export const getCurrentBudget = async () => {
  const response = await api.get("/budgets/current");

  return response.data;
};

export const setCurrentBudget = async (amount: number) => {
  const response = await api.post("/budgets", {
    amount,
  });

  return response.data;
};
