const prisma = require("../lib/prisma");

function enrichGoal(goal) {
  const remainingAmount = Math.max(Number(goal.target) - Number(goal.saved), 0);
  const percentage = Number(goal.target) > 0 ? Math.min((Number(goal.saved) / Number(goal.target)) * 100, 100) : 0;
  const monthlyContribution = Number(goal.monthlyContribution || 0);
  const estimatedMonths = monthlyContribution > 0 ? Math.ceil(remainingAmount / monthlyContribution) : null;
  const estimatedCompletionDate = estimatedMonths !== null ? new Date(new Date().getFullYear(), new Date().getMonth() + estimatedMonths, 1) : goal.targetDate;

  return {
    ...goal,
    percentage,
    remainingAmount,
    estimatedCompletionDate,
    timeline: goal.allocations.map((allocation) => ({
      id: allocation.id,
      amount: allocation.amount,
      createdAt: allocation.createdAt,
    })),
  };
}

const createGoal = async (req, res) => {
  try {
    const { title, target, monthlyContribution, targetDate } = req.body;

    const goal = await prisma.savingsGoal.create({
      data: {
        title,
        target: Number(target),
        monthlyContribution: Number(monthlyContribution || 0),
        targetDate: targetDate ? new Date(targetDate) : null,
        userId: req.user.id,
      },
      include: {
        allocations: true,
      },
    });

    res.status(201).json(enrichGoal(goal));
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getGoals = async (req, res) => {
  try {
    const goals = await prisma.savingsGoal.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        allocations: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(goals.map(enrichGoal));
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateGoal = async (req, res) => {
  try {
    const { saved, monthlyContribution, targetDate, title, target } = req.body;

    const goal = await prisma.savingsGoal.update({
      where: {
        id: req.params.id,
      },
      data: {
        ...(saved !== undefined ? { saved: Number(saved) } : {}),
        ...(monthlyContribution !== undefined ? { monthlyContribution: Number(monthlyContribution) } : {}),
        ...(targetDate !== undefined ? { targetDate: targetDate ? new Date(targetDate) : null } : {}),
        ...(title !== undefined ? { title } : {}),
        ...(target !== undefined ? { target: Number(target) } : {}),
      },
      include: {
        allocations: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    res.json(enrichGoal(goal));
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
