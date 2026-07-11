const prisma = require("../lib/prisma");
const { generateRecurringExpenses } = require("../services/recurringAutomationService");
const { buildExpenseWhere, buildIncomeWhere } = require("../utils/transactionFilters");

function mapExpense(expense) {
  return {
    ...expense,
    type: "expense",
  };
}

function mapIncome(income) {
  return {
    ...income,
    type: "income",
    category: income.source || "Income",
  };
}

const getTransactions = async (req, res) => {
  try {
    await generateRecurringExpenses(req.user.id);

    const includeExpenses = req.query.type !== "income";
    const includeIncome = req.query.type !== "expense";

    const [expenses, incomes] = await Promise.all([
      includeExpenses
        ? prisma.expense.findMany({
            where: buildExpenseWhere(req.user.id, req.query),
            orderBy: { date: "desc" },
          })
        : Promise.resolve([]),
      includeIncome
        ? prisma.income.findMany({
            where: buildIncomeWhere(req.user.id, req.query),
            orderBy: { date: "desc" },
          })
        : Promise.resolve([]),
    ]);

    const transactions = [...expenses.map(mapExpense), ...incomes.map(mapIncome)].sort(
      (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()
    );

    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const recreateFavorite = async (req, res) => {
  try {
    const { type, id } = req.body;

    if (type === "expense") {
      const favorite = await prisma.expense.findFirst({
        where: {
          id,
          userId: req.user.id,
          isFavorite: true,
        },
      });

      if (!favorite) {
        return res.status(404).json({
          message: "Favorite transaction not found",
        });
      }

      const created = await prisma.expense.create({
        data: {
          title: favorite.title,
          amount: favorite.amount,
          category: favorite.category,
          merchant: favorite.merchant,
          note: favorite.note,
          paymentMethod: favorite.paymentMethod,
          userId: req.user.id,
        },
      });

      return res.status(201).json(created);
    }

    const favorite = await prisma.income.findFirst({
      where: {
        id,
        userId: req.user.id,
        isFavorite: true,
      },
    });

    if (!favorite) {
      return res.status(404).json({
        message: "Favorite transaction not found",
      });
    }

    const created = await prisma.income.create({
      data: {
        title: favorite.title,
        amount: favorite.amount,
        source: favorite.source,
        merchant: favorite.merchant,
        note: favorite.note,
        paymentMethod: favorite.paymentMethod,
        userId: req.user.id,
      },
    });

    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getTransactions,
  recreateFavorite,
};
