import { api } from "./api";

export type ExpensePayload = {
  title: string;
  amount: number;
  category: string;
  date?: string;
  merchant?: string;
  note?: string;
  paymentMethod?: string;
  isFavorite?: boolean;
  importConfidence?: number;
};

export type ExpenseImportPayload = ExpensePayload & {
  correctedCategory?: string;
};

export const getExpenses = async (
  params?: Record<string, string | number | undefined>
) => {
  const response = await api.get("/expenses", {
    params,
  });
  return response.data;
};

export const createExpense = async (
  payload: ExpensePayload
) => {
  const response = await api.post("/expenses", payload);
  return response.data;
};

export const importExpenses = async (
  rows: ExpenseImportPayload[]
) => {
  const response = await api.post("/expenses/import", rows);
  return response.data;
};

export const updateExpense = async (
  id: string,
  payload: Partial<ExpensePayload>
) => {
  const response = await api.put(`/expenses/${id}`, payload);
  return response.data;
};

export const deleteExpense = async (id: string) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};
