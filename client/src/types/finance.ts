export interface BudgetSummary {
  budget: number;
  spent: number;
  remaining: number;
}

export interface AnalyticsItem {
  category: string;
  amount: number;
}

export interface RecurringExpense {
  id: string;
  title: string;
  amount: number;
  category: string;
  frequency: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  target: number;
  saved: number;
}
