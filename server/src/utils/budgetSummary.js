const prisma = require("../lib/prisma");
const { parseDateRange } = require("./dateRange");

function getCurrentMonthContext() {
  const now = new Date();

  return {
    now,
    month: now.getMonth() + 1,
    year: now.getFullYear(),

    startOfMonth: new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ),

    startOfNextMonth: new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    ),
  };
}

async function getMonthlyBudgetSummary(
  userId,
  query = {}
) {
  const { month, year } =
    getCurrentMonthContext();
  const { start, end } = parseDateRange(query);

  const [
    budget,
    expenses,
    allocationBatch,
    incomes,
  ] = await Promise.all([
    prisma.budget.findFirst({
      where: {
        userId,
        month,
        year,
      },
    }),

    prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
    }),

    prisma.savingsAllocationBatch.findFirst({
      where: {
        userId,
        month,
        year,
      },
    }),

    prisma.income.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
    }),
  ]);

  const spent = expenses.reduce(
    (sum, expense) =>
      sum + expense.amount,
    0
  );

  const totalIncome =
    incomes.reduce(
      (sum, income) =>
        sum + income.amount,
      0
    );

  const baseBudget =
    budget?.amount || 0;

  const effectiveBudget =
    baseBudget + totalIncome;

  const allocated =
    allocationBatch?.totalAllocated || 0;

  const remaining =
    effectiveBudget -
    spent -
    allocated;

  return {
    month,
    year,

    baseBudget,

    income: totalIncome,

    budget: effectiveBudget,

    spent,

    allocated,

    remaining,
  };
}

module.exports = {
  getCurrentMonthContext,
  getMonthlyBudgetSummary,
};
