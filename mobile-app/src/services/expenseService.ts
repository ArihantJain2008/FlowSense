import { api } from "./api";

export const getExpenses = async () => {
  const response = await api.get("/expenses");
  return response.data;
};

export const createExpense = async (
  title: string,
  amount: number,
  category: string,
  date?: string
) => {
  const response = await api.post("/expenses", {
    title,
    amount,
    category,
    date,
  });

  return response.data;
};

export const updateExpense = async (
  id: string,
  title: string,
  amount: number,
  category: string
) => {
  const response =
    await api.put(
      `/expenses/${id}`,
      {
        title,
        amount,
        category,
      }
    );

  return response.data;
};

export const deleteExpense = async (
  id: string
) => {
  const response = await api.delete(
    `/expenses/${id}`
  );

  return response.data;
};
