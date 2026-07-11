const prisma = require("../lib/prisma");

async function generateMonthlySnapshot(userId, month, year) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const [budget, incomes, expenses, previous] = await Promise.all([
    prisma.budget.findFirst({
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
          lt: end,
        },
      },
    }),
    prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lt: end,
        },
      },
    }),
    prisma.monthlySnapshot.findFirst({
      where: {
        userId,
        ...(month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }),
      },
    }),
  ]);

  const income = incomes.reduce((sum, item) => sum + item.amount, 0);
  const expenseTotal = expenses.reduce((sum, item) => sum + item.amount, 0);
  const budgetAmount = Number(budget?.amount || 0) + income;
  const savings = budgetAmount - expenseTotal;
  const budgetUsage = budgetAmount > 0 ? (expenseTotal / budgetAmount) * 100 : 0;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  const largestExpense = expenses.reduce((largest, current) => {
    if (!largest || current.amount > largest.amount) {
      return current;
    }
    return largest;
  }, null);

  const categoryMap = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  const topCategoryEntry = Object.entries(categoryMap).sort((left, right) => right[1] - left[1])[0];

  return prisma.monthlySnapshot.upsert({
    where: {
      userId_month_year: {
        userId,
        month,
        year,
      },
    },
    update: {
      income,
      expenses: expenseTotal,
      savings,
      budget: budgetAmount,
      budgetUsage,
      savingsRate,
      largestExpenseTitle: largestExpense?.title || null,
      largestExpenseAmount: largestExpense?.amount || null,
      topCategory: topCategoryEntry?.[0] || null,
      topCategoryAmount: topCategoryEntry?.[1] || null,
      comparisonIncome: previous ? income - previous.income : null,
      comparisonExpenses: previous ? expenseTotal - previous.expenses : null,
      comparisonSavings: previous ? savings - previous.savings : null,
    },
    create: {
      userId,
      month,
      year,
      income,
      expenses: expenseTotal,
      savings,
      budget: budgetAmount,
      budgetUsage,
      savingsRate,
      largestExpenseTitle: largestExpense?.title || null,
      largestExpenseAmount: largestExpense?.amount || null,
      topCategory: topCategoryEntry?.[0] || null,
      topCategoryAmount: topCategoryEntry?.[1] || null,
      comparisonIncome: previous ? income - previous.income : null,
      comparisonExpenses: previous ? expenseTotal - previous.expenses : null,
      comparisonSavings: previous ? savings - previous.savings : null,
    },
  });
}

async function getSnapshotsForUser(userId, limit = 12) {
  const now = new Date();
  const snapshots = [];

  for (let index = 0; index < limit; index += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const snapshot = await generateMonthlySnapshot(userId, date.getMonth() + 1, date.getFullYear());
    snapshots.push(snapshot);
  }

  return snapshots;
}

module.exports = {
  generateMonthlySnapshot,
  getSnapshotsForUser,
};
