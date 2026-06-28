import { api } from "./api";

export const getRecurringExpenses =
  async () => {
    const response =
      await api.get(
        "/recurring-expenses"
      );

    return response.data;
  };

export const createRecurringExpense =
  async (
    title: string,
    amount: number,
    category: string,
    frequency: string
  ) => {
    const response =
      await api.post(
        "/recurring-expenses",
        {
          title,
          amount,
          category,
          frequency,
        }
      );

    return response.data;
  };

export const deleteRecurringExpense =
  async (id: string) => {
    const response =
      await api.delete(
        `/recurring-expenses/${id}`
      );

    return response.data;
  };