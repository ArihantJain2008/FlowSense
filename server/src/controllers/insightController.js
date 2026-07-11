const prisma = require("../lib/prisma");
const { getMonthlyBudgetSummary } = require("../utils/budgetSummary");
const { buildExpenseWhere, buildIncomeWhere } = require("../utils/transactionFilters");
const { getSnapshotsForUser } = require("../services/snapshotService");
const { generateRecurringExpenses } = require("../services/recurringAutomationService");

const getOverview = async (req, res) => {
  try {
    await generateRecurringExpenses(req.user.id);

    const [summary, expenses, incomes, snapshots] = await Promise.all([
      getMonthlyBudgetSummary(req.user.id, req.query),
      prisma.expense.findMany({
        where: buildExpenseWhere(req.user.id, req.query),
        orderBy: { date: "asc" },
      }),
      prisma.income.findMany({
        where: buildIncomeWhere(req.user.id, req.query),
        orderBy: { date: "asc" },
      }),
      getSnapshotsForUser(req.user.id, 6),
    ]);

    const categoryTotals = {};

    expenses.forEach((item) => {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
    });

    const categories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((left, right) => right.amount - left.amount);

    res.json({
      summary,
      categories,
      totals: {
        income: incomes.reduce((sum, item) => sum + item.amount, 0),
        expenses: expenses.reduce((sum, item) => sum + item.amount, 0),
        savings: summary.remaining,
      },
      snapshots,
      recentTransactions: [
        ...expenses.map((item) => ({ ...item, type: "expense" })),
        ...incomes.map((item) => ({
          ...item,
          type: "income",
          category: item.source || "Income",
        })),
      ]
        .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
        .slice(0, 5),
      transactionCount: expenses.length + incomes.length,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getOverview,
};
