const prisma = require("../lib/prisma");

const createIncome = async (req, res) => {
  try {
    const {
      title,
      amount,
      source,
      date,
    } = req.body;

    const parsedDate =
      date
        ? new Date(date)
        : new Date();

    const existingIncome =
      await prisma.income.findFirst({
        where: {
          userId: req.user.id,
          title,
          amount: Number(amount),
          createdAt: parsedDate,
        },
      });

    if (existingIncome) {
      return res.status(409).json({
        message: "Duplicate income",
      });
    }

    const income =
      await prisma.income.create({
        data: {
          title,
          amount: Number(amount),
          source,
          createdAt: parsedDate,
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

const updateIncome = async (req, res) => {
  try {
    const {
      title,
      amount,
      source,
      date,
    } = req.body;

    const existingIncome =
      await prisma.income.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

    if (!existingIncome) {
      return res.status(404).json({
        message: "Income not found",
      });
    }

    const income =
      await prisma.income.update({
        where: {
          id: existingIncome.id,
        },
        data: {
          title,
          amount: Number(amount),
          source,
          createdAt: date
            ? new Date(date)
            : existingIncome.createdAt,
        },
      });

    res.json(income);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const existingIncome =
      await prisma.income.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

    if (!existingIncome) {
      return res.status(404).json({
        message: "Income not found",
      });
    }

    await prisma.income.delete({
      where: {
        id: existingIncome.id,
      },
    });

    res.json({
      message: "Income deleted",
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
  updateIncome,
  deleteIncome,
};