export type DateRangePreset =
  | "today"
  | "thisWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "custom";

export type ExpenseItem = {
  id: string;
  title: string;
  amount: number;
  category: string;
  merchant?: string | null;
  note?: string | null;
  paymentMethod?: string | null;
  isFavorite?: boolean;
  date?: string;
  createdAt?: string;
};

export type IncomeItem = {
  id: string;
  title: string;
  amount: number;
  source: string;
  merchant?: string | null;
  note?: string | null;
  paymentMethod?: string | null;
  isFavorite?: boolean;
  date?: string;
  createdAt?: string;
};

export type SavingsGoalTimelineItem = {
  id: string;
  amount: number;
  createdAt: string;
};

export type SavingsGoalItem = {
  id: string;
  title: string;
  target: number;
  saved: number;
  monthlyContribution?: number;
  targetDate?: string | null;
  percentage?: number;
  remainingAmount?: number;
  estimatedCompletionDate?: string | null;
  timeline?: SavingsGoalTimelineItem[];
};

export type RecurringExpenseItem = {
  id: string;
  title: string;
  amount: number;
  category: string;
  merchant?: string | null;
  note?: string | null;
  paymentMethod?: string | null;
  frequency: string;
  nextRunAt?: string;
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

export type AnalyticsSeriesPoint = {
  label: string;
  amount: number;
};

export type AnalyticsItem = {
  category: string;
  amount: number;
};

export type AnalyticsResponse = {
  categories: AnalyticsItem[];
  monthlyTrend: AnalyticsSeriesPoint[];
  weeklyTrend: AnalyticsSeriesPoint[];
  topCategories: AnalyticsItem[];
  topCategory?: AnalyticsItem | null;
  largestExpense?: ExpenseItem | null;
  totalExpenses: number;
  totalIncome: number;
  budgetUsage: number;
  savingsRate: number;
  summary: {
    startDate: string;
    endDate: string;
    dayCount: number;
    baseBudget: number;
    effectiveBudget: number;
    income: number;
    expenses: number;
    netSavings: number;
  };
  comparison: {
    previousStartDate: string;
    previousEndDate: string;
    previousExpenses: number;
    previousIncome: number;
    previousNetSavings: number;
    previousSavingsRate: number;
    expenseChange: number;
    incomeChange: number;
    savingsChange: number;
    expenseChangePercent: number;
    incomeChangePercent: number;
    savingsRateChange: number;
  };
};

export type AppTransaction = {
  id: string;
  type: "expense" | "income";
  title: string;
  amount: number;
  category: string;
  source?: string | null;
  merchant?: string | null;
  note?: string | null;
  paymentMethod?: string | null;
  isFavorite?: boolean;
  date: string;
};
