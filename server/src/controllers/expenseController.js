const prisma = require("../lib/prisma");

const createExpense = async (req, res) => {
  try {
    const { title, amount, category } = req.body;

    const expense = await prisma.expense.create({
      data: {
        title,
        amount: Number(amount),
        category,
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
        date: "desc",
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
    const { title, amount, category } = req.body;

    const expense = await prisma.expense.update({
      where: {
        id: req.params.id,
      },
      data: {
        title,
        amount: Number(amount),
        category,
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
    await prisma.expense.delete({
      where: {
        id: req.params.id,
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

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
};