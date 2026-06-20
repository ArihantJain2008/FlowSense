import api from "./api";

export const getExpenses = async () => {
  const res = await api.get("/expenses");
  return res.data;
};

export const createExpense = async (
  expense: {
    title: string;
    amount: number;
    category: string;
  }
) => {
  const res = await api.post(
    "/expenses",
    expense
  );

  return res.data;
};

export const deleteExpense = async (
  id: string
) => {
  const res = await api.delete(
    `/expenses/${id}`
  );

  return res.data;
};