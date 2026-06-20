const prisma = require("../lib/prisma");
const {
  getCurrentMonthContext,
  getMonthlyBudgetSummary,
} = require("../utils/budgetSummary");

const getSavingsAllocationSummary =
  async (req, res) => {
    try {
      const summary =
        await getMonthlyBudgetSummary(
          req.user.id
        );

      const goals =
        await prisma.savingsGoal.findMany({
          where: {
            userId: req.user.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      res.json({
        budget: summary.budget,
        spent: summary.spent,
        remaining: summary.remaining,
        goals,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

const allocateSavings = async (
  req,
  res
) => {
  try {
    const allocations =
      req.body.allocations;

    if (
      !Array.isArray(allocations) ||
      allocations.length === 0
    ) {
      return res.status(400).json({
        message:
          "At least one allocation is required",
      });
    }

    const normalizedAllocations =
      allocations.map(
        (allocation) => ({
          goalId: allocation.goalId,
          amount: Number(
            allocation.amount
          ),
        })
      );

    if (
      normalizedAllocations.some(
        (allocation) =>
          !allocation.goalId ||
          Number.isNaN(
            allocation.amount
          ) ||
          allocation.amount <= 0
      )
    ) {
      return res.status(400).json({
        message:
          "Allocation amounts must be positive",
      });
    }

    const goalIds =
      normalizedAllocations.map(
        (allocation) =>
          allocation.goalId
      );

    const uniqueGoalIds =
      new Set(goalIds);

    if (
      uniqueGoalIds.size !==
      goalIds.length
    ) {
      return res.status(400).json({
        message:
          "Each goal can only be allocated once per request",
      });
    }

    const summary =
      await getMonthlyBudgetSummary(
        req.user.id
      );

    const totalAllocation =
      normalizedAllocations.reduce(
        (sum, allocation) =>
          sum + allocation.amount,
        0
      );

    if (summary.remaining <= 0) {
      return res.status(400).json({
        message:
          "No remaining budget is available for savings allocation",
      });
    }

    if (
      totalAllocation >
      summary.remaining
    ) {
      return res.status(400).json({
        message:
          "Total allocation cannot exceed remaining budget",
      });
    }

    const { month, year } =
      getCurrentMonthContext();

    const existingBatch =
      await prisma.savingsAllocationBatch.findFirst(
        {
          where: {
            userId: req.user.id,
            month,
            year,
          },
        }
      );

    if (existingBatch) {
      return res.status(409).json({
        message:
          "Savings allocation has already been completed for this month",
      });
    }

    const goals =
      await prisma.savingsGoal.findMany({
        where: {
          userId: req.user.id,
          id: {
            in: Array.from(
              uniqueGoalIds
            ),
          },
        },
      });

    if (
      goals.length !==
      uniqueGoalIds.size
    ) {
      return res.status(404).json({
        message:
          "One or more savings goals were not found for this user",
      });
    }

    const goalMap = new Map(
      goals.map((goal) => [
        goal.id,
        goal,
      ])
    );

    for (const allocation of normalizedAllocations) {
      const goal = goalMap.get(
        allocation.goalId
      );

      if (!goal) {
        return res.status(404).json({
          message:
            "Savings goal not found",
        });
      }

      const remainingGoalAmount =
        goal.target - goal.saved;

      if (
        allocation.amount >
        remainingGoalAmount
      ) {
        return res.status(400).json({
          message: `Allocation for ${goal.title} exceeds the amount needed to complete the goal`,
        });
      }
    }

    const batch =
      await prisma.$transaction(
        async (tx) => {
          const createdBatch =
            await tx.savingsAllocationBatch.create(
              {
                data: {
                  userId: req.user.id,
                  month,
                  year,
                  totalAllocated:
                    totalAllocation,
                },
              }
            );

          for (const allocation of normalizedAllocations) {
            await tx.savingsAllocation.create({
              data: {
                batchId:
                  createdBatch.id,
                goalId:
                  allocation.goalId,
                amount:
                  allocation.amount,
              },
            });

            await tx.savingsGoal.update({
              where: {
                id: allocation.goalId,
              },
              data: {
                saved: {
                  increment:
                    allocation.amount,
                },
              },
            });
          }

          return createdBatch;
        }
      );

    res.status(201).json({
      message:
        "Savings allocation completed successfully",
      batchId: batch.id,
      totalAllocated,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getSavingsAllocationSummary,
  allocateSavings,
};
