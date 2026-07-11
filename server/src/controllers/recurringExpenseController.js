const prisma = require("../lib/prisma");
const { generateRecurringExpenses } = require("../services/recurringAutomationService");

function computeSchedule(frequency, startDate) {
  const base = startDate ? new Date(startDate) : new Date();

  return {
    startDate: base,
    nextRunAt: base,
    dayOfMonth: base.getDate(),
    dayOfWeek: base.getDay(),
    frequency,
  };
}

const createRecurringExpense = async (req, res) => {
  try {
    const {
      title,
      amount,
      category,
      frequency,
      merchant,
      note,
      paymentMethod,
      startDate,
    } = req.body;

    const schedule = computeSchedule(frequency, startDate);

    const recurring = await prisma.recurringExpense.create({
      data: {
        title,
        amount: Number(amount),
        category,
        merchant: merchant || null,
        note: note || null,
        paymentMethod: paymentMethod || null,
        ...schedule,
        userId: req.user.id,
      },
    });

    res.status(201).json(recurring);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getRecurringExpenses = async (req, res) => {
  try {
    await generateRecurringExpenses(req.user.id);

    const recurring = await prisma.recurringExpense.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(recurring);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteRecurringExpense = async (req, res) => {
  try {
    const recurring = await prisma.recurringExpense.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!recurring) {
      return res.status(404).json({
        message: "Recurring expense not found",
      });
    }

    await prisma.recurringExpense.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json({
      message: "Recurring expense deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createRecurringExpense,
  getRecurringExpenses,
  deleteRecurringExpense,
};
