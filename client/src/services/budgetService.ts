import api from "./api";

export const getBudgetSummary =
  async () => {
    const res =
      await api.get(
        "/budgets/summary"
      );

    return res.data;
  };