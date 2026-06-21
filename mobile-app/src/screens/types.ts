export type ExpenseItem = {
  id: string;
  title: string;
  amount: number;
  category: string;
  date?: string;
  createdAt?: string;
};

export type IncomeItem = {
  id: string;
  title: string;
  amount: number;
  source: string;
  date?: string;
  createdAt?: string;
};

export type SavingsGoalItem = {
  id: string;
  title: string;
  target: number;
  saved: number;
};

export type RecurringExpenseItem = {
  id: string;
  title: string;
  amount: number;
  category: string;
  frequency: string;
};

export type DashboardSummary = {
  budget: number;
  baseBudget: number;
  income: number;
  spent: number;
  allocated: number;
  remaining: number;
};

export type AllocationSummary = {
  budget: number;
  spent: number;
  remaining: number;
  goals: SavingsGoalItem[];
};

export type AnalyticsItem = {
  category: string;
  amount: number;
};
