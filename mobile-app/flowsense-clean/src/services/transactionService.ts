import { getExpenses } from "./expenseService";
import { getIncome } from "./incomeService";

export type TransactionFilter = {
  month?: string;
  category?: string;
  minAmount?: number | null;
  maxAmount?: number | null;
  query?: string;
};

export type TransactionRecord = {
  id: string;
  type: "expense" | "income";
  title: string;
  amount: number;
  category: string;
  date: string;
  source?: string;
};

export const getAllTransactions =
  async (): Promise<TransactionRecord[]> => {
    const [expenses, income] =
      await Promise.all([
        getExpenses(),
        getIncome(),
      ]);

    return [
      ...expenses.map((item: any) => ({
        id: item.id,
        type: "expense" as const,
        title: item.title,
        amount: Number(item.amount ?? 0),
        category: item.category,
        date:
          item.date ??
          item.createdAt ??
          new Date().toISOString(),
      })),
      ...income.map((item: any) => ({
        id: item.id,
        type: "income" as const,
        title: item.title,
        amount: Number(item.amount ?? 0),
        category: item.source || "Income",
        source: item.source || "",
        date:
          item.createdAt ??
          new Date().toISOString(),
      })),
    ].sort(
      (left, right) =>
        new Date(right.date).getTime() -
        new Date(left.date).getTime()
    );
  };

export const filterTransactions = (
  transactions: TransactionRecord[],
  filters: TransactionFilter
) => {
  return transactions.filter((item) => {
    const query =
      filters.query?.trim().toLowerCase() ||
      "";
    const amount = Number(item.amount);

    const matchesQuery = query
      ? [
          item.title,
          item.category,
          item.source,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;

    const matchesCategory =
      filters.category &&
      filters.category !== "All"
        ? item.category ===
            filters.category ||
          item.source ===
            filters.category
        : true;

    const monthKey = item.date.slice(0, 7);
    const matchesMonth = filters.month
      ? monthKey === filters.month
      : true;

    const matchesMin =
      typeof filters.minAmount === "number"
        ? amount >= filters.minAmount
        : true;
    const matchesMax =
      typeof filters.maxAmount === "number"
        ? amount <= filters.maxAmount
        : true;

    return (
      matchesQuery &&
      matchesCategory &&
      matchesMonth &&
      matchesMin &&
      matchesMax
    );
  });
};
