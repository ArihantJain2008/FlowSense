import api from "./api";

export const getBudgetSummary =
  async () => {
    const res =
      await api.get(
        "/budgets/summary"
      );

    return res.data;
  };

  export const setBudget =
  async (amount: number) => {
    const res =
      await api.post(
        "/budgets",
        { amount }
      );

    return res.data;
  };