import { api } from "./api";

export const getIncome = async () => {
  const response = await api.get("/income");
  return response.data;
};

export const createIncome = async (
  title: string,
  amount: number,
  source: string,
  date?: string
) => {
  const response = await api.post(
    "/income",
    {
      title,
      amount,
      source,
      date,
    }
  );

  return response.data;
};

export const updateIncome = async (
  id: string,
  payload: {
    title: string;
    amount: number;
    source: string;
    date?: string;
  }
) => {
  const response = await api.put(
    `/income/${id}`,
    payload
  );

  return response.data;
};

export const deleteIncome = async (
  id: string
) => {
  const response = await api.delete(
    `/income/${id}`
  );

  return response.data;
};
