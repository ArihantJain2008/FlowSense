import { api } from "./api";

export type ExpenseTemplatePayload = {
  name: string;
  title: string;
  amount: number;
  category: string;
  merchant?: string;
  note?: string;
  paymentMethod?: string;
};

export type ExpenseTemplateItem = {
  id: string;
  name: string;
  title: string;
  amount: number;
  category: string;
  merchant?: string | null;
  note?: string | null;
  paymentMethod?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export const getExpenseTemplates = async () => {
  const response = await api.get("/expense-templates");
  return response.data as ExpenseTemplateItem[];
};

export const createExpenseTemplate = async (payload: ExpenseTemplatePayload) => {
  const response = await api.post("/expense-templates", payload);
  return response.data as ExpenseTemplateItem;
};

export const updateExpenseTemplate = async (id: string, payload: Partial<ExpenseTemplatePayload>) => {
  const response = await api.put(`/expense-templates/${id}`, payload);
  return response.data as ExpenseTemplateItem;
};

export const deleteExpenseTemplate = async (id: string) => {
  const response = await api.delete(`/expense-templates/${id}`);
  return response.data;
};
