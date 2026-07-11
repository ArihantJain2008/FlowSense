const prisma = require("../lib/prisma");

function nextDate(current, recurring) {
  const next = new Date(current);
  const frequency = recurring.frequency.toLowerCase();

  if (frequency === "weekly") {
    next.setDate(next.getDate() + 7);
    return next;
  }

  if (frequency === "quarterly") {
    next.setMonth(next.getMonth() + 3);
    return next;
  }

  if (frequency === "yearly") {
    next.setFullYear(next.getFullYear() + 1);
    return next;
  }

  next.setMonth(next.getMonth() + 1);
  return next;
}

async function generateRecurringExpenses(userId) {
  const now = new Date();
  const recurringExpenses = await prisma.recurringExpense.findMany({
    where: {
      userId,
      isActive: true,
      nextRunAt: {
        lte: now,
      },
    },
    orderBy: {
      nextRunAt: "asc",
    },
  });

  for (const recurring of recurringExpenses) {
    let cursor = new Date(recurring.nextRunAt);

    while (cursor <= now) {
      await prisma.expense.upsert({
        where: {
          id: `${recurring.id}-${cursor.toISOString()}`,
        },
        update: {},
        create: {
          id: `${recurring.id}-${cursor.toISOString()}`,
          title: recurring.title,
          amount: recurring.amount,
          category: recurring.category,
          merchant: recurring.merchant,
          note: recurring.note,
          paymentMethod: recurring.paymentMethod,
          date: cursor,
          isRecurringGenerated: true,
          recurringExpenseId: recurring.id,
          userId,
        },
      }).catch(async () => {
        const exists = await prisma.expense.findFirst({
          where: {
            userId,
            recurringExpenseId: recurring.id,
            date: cursor,
          },
        });

        if (!exists) {
          throw new Error("Unable to generate recurring expense");
        }
      });

      cursor = nextDate(cursor, recurring);
    }

    await prisma.recurringExpense.update({
      where: {
        id: recurring.id,
      },
      data: {
        lastGeneratedAt: now,
        nextRunAt: cursor,
      },
    });
  }
}

module.exports = {
  generateRecurringExpenses,
};
