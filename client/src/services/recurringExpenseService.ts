import api from "./api";

export const getRecurringExpenses =
  async () => {
    const res =
      await api.get(
        "/recurring-expenses"
      );

    return res.data;
  };

export const createRecurringExpense =
  async (data: {
    title: string;
    amount: number;
    category: string;
    frequency: string;
  }) => {
    const res =
      await api.post(
        "/recurring-expenses",
        data
      );

    return res.data;
  };

export const deleteRecurringExpense =
  async (id: string) => {
    const res =
      await api.delete(
        `/recurring-expenses/${id}`
      );

    return res.data;
  };