const prisma = require("../lib/prisma");

const createExpense = async (req, res) => {
  try {
    const {
      title,
      amount,
      category,
      date,
    } = req.body;

    const expense = await prisma.expense.create({
      data: {
        title,
        amount: Number(amount),
        category,
        date: date ? new Date(date) : undefined,
        userId: req.user.id,
      },
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getExpenses = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
  createdAt: "desc",
  },
    });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateExpense = async (req, res) => {
  try {
    const {
      title,
      amount,
      category,
      date,
    } = req.body;

    const existingExpense =
      await prisma.expense.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

    if (!existingExpense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    const expense = await prisma.expense.update({
      where: {
        id: existingExpense.id,
      },
      data: {
        title,
        amount: Number(amount),
        category,
        date: date
          ? new Date(date)
          : existingExpense.date,
      },
    });

    res.json(expense);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const existingExpense =
      await prisma.expense.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

    if (!existingExpense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    await prisma.expense.delete({
      where: {
        id: existingExpense.id,
      },
    });

    res.json({
      message: "Expense deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAnalytics =
  async (req, res) => {
    try {
      const expenses =
        await prisma.expense.findMany({
          where: {
            userId: req.user.id,
          },
        });

      const categoryMap = {};

      expenses.forEach(
        (expense) => {
          categoryMap[
            expense.category
          ] =
            (categoryMap[
              expense.category
            ] || 0) +
            expense.amount;
        }
      );

      const analytics =
        Object.entries(
          categoryMap
        ).map(
          ([category, amount]) => ({
            category,
            amount,
          })
        );

      res.json(analytics);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getAnalytics
};
