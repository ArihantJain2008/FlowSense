const prisma = require("../lib/prisma");

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
  userId
) {
  const {
    month,
    year,
    startOfMonth,
    startOfNextMonth,
  } = getCurrentMonthContext();

  const [
    budget,
    expenses,
    allocationBatch,
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
          gte: startOfMonth,
          lt: startOfNextMonth,
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
  ]);

  const spent = expenses.reduce(
    (sum, expense) =>
      sum + expense.amount,
    0
  );

  const budgetAmount =
    budget?.amount || 0;

  const allocated =
    allocationBatch?.totalAllocated || 0;

  return {
    month,
    year,
    budget: budgetAmount,
    spent,
    allocated,
    remaining:
      budgetAmount - spent - allocated,
  };
}

module.exports = {
  getCurrentMonthContext,
  getMonthlyBudgetSummary,
};
