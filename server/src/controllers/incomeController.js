const prisma = require("../lib/prisma");

const createIncome = async (req, res) => {
  try {
    const { title, amount, source } =
      req.body;

    const income =
      await prisma.income.create({
        data: {
          title,
          amount: Number(amount),
          source,
          userId: req.user.id,
        },
      });

    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getIncome = async (req, res) => {
  try {
    const incomes =
      await prisma.income.findMany({
        where: {
          userId: req.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    res.json(incomes);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteIncome =
  async (req, res) => {
    try {
      await prisma.income.delete({
        where: {
          id: req.params.id,
        },
      });

      res.json({
        message:
          "Income deleted",
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

module.exports = {
  createIncome,
  getIncome,
  deleteIncome,
};