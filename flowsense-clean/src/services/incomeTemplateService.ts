import { api } from "./api";

export type IncomeTemplatePayload = {
  name: string;
  title: string;
  amount: number;
  date: string;
  source?: string;
  merchant?: string;
  note?: string;
  paymentMethod?: string;
};

export type IncomeTemplateItem = {
  id: string;
  name: string;
  title: string;
  amount: number;
  date: string;
  source?: string | null;
  merchant?: string | null;
  note?: string | null;
  paymentMethod?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export const getIncomeTemplates = async () => {
  const response = await api.get("/income-templates");
  return response.data as IncomeTemplateItem[];
};

export const createIncomeTemplate = async (payload: IncomeTemplatePayload) => {
  const response = await api.post("/income-templates", payload);
  return response.data as IncomeTemplateItem;
};

export const updateIncomeTemplate = async (id: string, payload: Partial<IncomeTemplatePayload>) => {
  const response = await api.put(`/income-templates/${id}`, payload);
  return response.data as IncomeTemplateItem;
};

export const deleteIncomeTemplate = async (id: string) => {
  const response = await api.delete(`/income-templates/${id}`);
  return response.data;
};
