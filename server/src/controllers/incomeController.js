const prisma = require("../lib/prisma");
const { buildIncomeWhere } = require("../utils/transactionFilters");

function normalizePayload(body = {}) {
  return {
    title: body.title,
    amount: Number(body.amount),
    source: body.source || null,
    merchant: body.merchant || null,
    note: body.note || null,
    paymentMethod: body.paymentMethod || null,
    isFavorite: Boolean(body.isFavorite),
    date: body.date ? new Date(body.date) : new Date(),
  };
}

const createIncome = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);

    const existingIncome = await prisma.income.findFirst({
      where: {
        userId: req.user.id,
        title: payload.title,
        amount: payload.amount,
        date: payload.date,
      },
    });

    if (existingIncome) {
      return res.status(409).json({
        message: "Duplicate income",
      });
    }

    const income = await prisma.income.create({
      data: {
        ...payload,
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
    const incomes = await prisma.income.findMany({
      where: buildIncomeWhere(req.user.id, req.query),
      orderBy: {
        date: "desc",
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
    const existingIncome = await prisma.income.findFirst({
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

    const payload = normalizePayload({
      ...existingIncome,
      ...req.body,
      isFavorite: req.body.isFavorite ?? existingIncome.isFavorite,
    });

    const income = await prisma.income.update({
      where: {
        id: existingIncome.id,
      },
      data: payload,
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
    const existingIncome = await prisma.income.findFirst({
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
