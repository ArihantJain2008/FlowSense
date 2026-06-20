const prisma = require("../lib/prisma");

const createRecurringExpense =
  async (req, res) => {
    try {
      const {
        title,
        amount,
        category,
        frequency,
      } = req.body;

      const recurring =
        await prisma.recurringExpense.create({
          data: {
            title,
            amount: Number(amount),
            category,
            frequency,
            userId: req.user.id,
          },
        });

      res.status(201).json(
        recurring
      );
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

const getRecurringExpenses =
  async (req, res) => {
    try {
      const recurring =
        await prisma.recurringExpense.findMany({
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

const deleteRecurringExpense =
  async (req, res) => {
    try {
      console.log(
        "ID:",
        req.params.id
      );

      const recurring =
        await prisma.recurringExpense.findUnique({
          where: {
            id: req.params.id,
          },
        });

      console.log(recurring);

      await prisma.recurringExpense.delete({
        where: {
          id: req.params.id,
        },
      });

      res.json({
        message:
          "Recurring expense deleted",
      });
    } catch (error) {
      console.log(error);

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