import type {
  AnalyticsItem,
  BudgetSummary,
  SavingsGoal,
} from "../types/finance";

export const expenseCategories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Other",
] as const;

export const subscriptionCategories = [
  "Entertainment",
  "Health",
  "Bills",
  "Other",
] as const;

export const subscriptionFrequencies = [
  "Monthly",
  "Yearly",
] as const;

export function formatCurrency(
  value: number
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(value);
}

export function getBudgetProgress(
  summary: BudgetSummary
) {
  if (summary.budget <= 0) {
    return 0;
  }

  return Math.min(
    (summary.spent / summary.budget) * 100,
    100
  );
}

export function getGoalProgress(
  goal: SavingsGoal
) {
  if (goal.target <= 0) {
    return 0;
  }

  return Math.min(
    (goal.saved / goal.target) * 100,
    100
  );
}

export function getTopCategory(
  analytics: AnalyticsItem[]
) {
  if (analytics.length === 0) {
    return null;
  }

  return analytics.reduce(
    (top, item) =>
      item.amount > top.amount
        ? item
        : top,
    analytics[0]
  );
}
