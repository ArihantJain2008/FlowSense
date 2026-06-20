const prisma = require("../lib/prisma");

exports.setBudget = async (
  req,
  res
) => {
  try {
    const { amount } = req.body;

    const now = new Date();

    const month =
      now.getMonth() + 1;

    const year =
      now.getFullYear();

    const existingBudget =
      await prisma.budget.findFirst({
        where: {
          userId: req.user.id,
          month,
          year,
        },
      });

    if (existingBudget) {
      const updated =
        await prisma.budget.update({
          where: {
            id: existingBudget.id,
          },
          data: {
            amount,
          },
        });

      return res.json(updated);
    }

    const budget =
      await prisma.budget.create({
        data: {
          amount,
          month,
          year,
          userId: req.user.id,
        },
      });

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getCurrentBudget =
  async (req, res) => {
    try {
      const now = new Date();

      const month =
        now.getMonth() + 1;

      const year =
        now.getFullYear();

      const budget =
        await prisma.budget.findFirst({
          where: {
            userId: req.user.id,
            month,
            year,
          },
        });

      res.json(
        budget || {
          amount: 0,
        }
      );
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };