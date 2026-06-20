const prisma = require("../lib/prisma");

const createGoal = async (req, res) => {
  try {
    const { title, target } = req.body;

    const goal =
      await prisma.savingsGoal.create({
        data: {
          title,
          target: Number(target),
          userId: req.user.id,
        },
      });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getGoals = async (req, res) => {
  try {
    const goals =
      await prisma.savingsGoal.findMany({
        where: {
          userId: req.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    res.json(goals);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateGoal = async (req, res) => {
  try {
    const { saved } = req.body;

    const goal =
      await prisma.savingsGoal.update({
        where: {
          id: req.params.id,
        },
        data: {
          saved: Number(saved),
        },
      });

    res.json(goal);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteGoal = async (req, res) => {
  try {
    await prisma.savingsGoal.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json({
      message: "Goal deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
};