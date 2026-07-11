import { api } from "./api";

export type IncomePayload = {
  title: string;
  amount: number;
  source: string;
  date?: string;
  merchant?: string;
  note?: string;
  paymentMethod?: string;
  isFavorite?: boolean;
};

export const getIncome = async (
  params?: Record<string, string | number | undefined>
) => {
  const response = await api.get("/income", {
    params,
  });
  return response.data;
};

export const createIncome = async (
  payload: IncomePayload
) => {
  const response = await api.post("/income", payload);
  return response.data;
};

export const updateIncome = async (
  id: string,
  payload: Partial<IncomePayload>
) => {
  const response = await api.put(`/income/${id}`, payload);
  return response.data;
};

export const deleteIncome = async (id: string) => {
  const response = await api.delete(`/income/${id}`);
  return response.data;
};
