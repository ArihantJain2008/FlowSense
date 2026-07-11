import { api } from "./api";

export type TransactionFilter = {
  preset?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  type?: "income" | "expense" | "all";
  minAmount?: number | null;
  maxAmount?: number | null;
  search?: string;
  paymentMethod?: string;
  merchant?: string;
  favorite?: boolean;
};

export const getAllTransactions = async (
  filters: TransactionFilter = {}
) => {
  const params: Record<string, string | number | undefined> = {
    preset: filters.preset,
    startDate: filters.startDate,
    endDate: filters.endDate,
    category: filters.category,
    type:
      filters.type && filters.type !== "all"
        ? filters.type
        : undefined,
    minAmount: filters.minAmount ?? undefined,
    maxAmount: filters.maxAmount ?? undefined,
    search: filters.search,
    paymentMethod: filters.paymentMethod,
    merchant: filters.merchant,
    favorite: filters.favorite ? "true" : undefined,
  };

  const response = await api.get("/transactions", {
    params,
  });

  return response.data;
};

export const recreateFavoriteTransaction = async (
  type: "expense" | "income",
  id: string
) => {
  const response = await api.post(
    "/transactions/favorites/recreate",
    {
      type,
      id,
    }
  );

  return response.data;
};
