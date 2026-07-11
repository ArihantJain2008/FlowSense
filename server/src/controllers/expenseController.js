const prisma = require("../lib/prisma");
const { generateRecurringExpenses } = require("../services/recurringAutomationService");
const { ensureExpenseTemplateTable } = require("../utils/ensureExpenseTemplateTable");
const { normalizeTemplatePayload } = require("../utils/expenseTemplatePayload");
const { buildExpenseWhere } = require("../utils/transactionFilters");
const { buildIncomeWhere } = require("../utils/transactionFilters");
const { parseDateRange } = require("../utils/dateRange");
const {
  normalizePattern,
  normalizeImportedTransaction,
  classifyTransaction,
} = require("../utils/importNormalizer");

function normalizePayload(body = {}) {
  return {
    title: body.title,
    amount: Number(body.amount),
    category: body.category,
    merchant: body.merchant || null,
    note: body.note || null,
    paymentMethod: body.paymentMethod || null,
    isFavorite: Boolean(body.isFavorite),
    importConfidence:
      body.importConfidence !== undefined
        ? Number(body.importConfidence)
        : null,
    date: body.date ? new Date(body.date) : new Date(),
  };
}

async function findCategoryRule(userId, title, merchant) {
  const normalizedTitle = normalizePattern(title || "");
  const normalizedMerchant = normalizePattern(merchant || "");

  return prisma.categoryRule.findFirst({
    where: {
      userId,
      OR: [
        {
          pattern: {
            contains: normalizedTitle,
            mode: "insensitive",
          },
        },
        {
          pattern: {
            contains: normalizedMerchant,
            mode: "insensitive",
          },
        },
        {
          normalizedMerchant: {
            contains: normalizedMerchant,
            mode: "insensitive",
          },
        },
      ],
    },
  });
}

async function createOrUpdateCategoryRule(userId, merchant, category) {
  const pattern = normalizePattern(merchant || category || "");
  if (!pattern || !category) {
    return null;
  }

  return prisma.categoryRule.upsert({
    where: {
      userId_pattern: {
        userId,
        pattern,
      },
    },
    update: {
      normalizedMerchant: merchant,
      category,
    },
    create: {
      pattern,
      normalizedMerchant: merchant,
      category,
      userId,
    },
  });
}

async function resolveExpenseClassification(userId, title, merchant, category) {
  const parsed = normalizeImportedTransaction(title || "");
  const normalizedMerchant = merchant || parsed.merchant;
  const rule = await findCategoryRule(userId, title || "", normalizedMerchant);

  if (rule) {
    return {
      title: parsed.title || title,
      merchant: normalizedMerchant || rule.normalizedMerchant,
      category: rule.category,
      confidenceLabel: "High",
      confidenceScore: 0.95,
      paymentMethod: parsed.paymentMethod,
    };
  }

  const resolvedCategory = category || classifyTransaction(title || normalizedMerchant || parsed.title);
  const confidence = parsed.confidenceLabel === "Low" && resolvedCategory !== "Other"
    ? {
        confidenceLabel: "Medium",
        confidenceScore: 0.7,
      }
    : {
        confidenceLabel: parsed.confidenceLabel,
        confidenceScore: parsed.confidenceScore,
      };

  return {
    title: parsed.title || title,
    merchant: normalizedMerchant,
    category: resolvedCategory,
    confidenceLabel: confidence.confidenceLabel,
    confidenceScore: confidence.confidenceScore,
    paymentMethod: parsed.paymentMethod,
  };
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getWeekStart(date) {
  const weekStart = new Date(date);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  return weekStart;
}

function listMonthsBetween(start, end) {
  const months = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor <= last) {
    months.push({
      month: cursor.getMonth() + 1,
      year: cursor.getFullYear(),
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}

function buildRangeQuery(query, start, end) {
  return {
    ...query,
    preset: "custom",
    startDate: formatDateKey(start),
    endDate: formatDateKey(end),
  };
}

function sumAmount(items) {
  return items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

function buildTrendPoints(map) {
  return Object.entries(map)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, amount]) => ({
      label,
      amount,
    }));
}

function calculatePercentageChange(current, previous) {
  if (!previous) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

const createExpense = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);

    const existingExpense = await prisma.expense.findFirst({
      where: {
        userId: req.user.id,
        title: payload.title,
        amount: payload.amount,
        date: payload.date,
      },
    });

    if (existingExpense) {
      return res.status(409).json({
        message: "Duplicate expense",
      });
    }

    const expense = await prisma.expense.create({
      data: {
        ...payload,
        userId: req.user.id,
      },
    });

    if (payload.isFavorite) {
      await ensureExpenseTemplateTable();

      const existingTemplate = await prisma.expenseTemplate.findFirst({
        where: {
          userId: req.user.id,
          title: expense.title,
          amount: expense.amount,
        },
      });

      const templatePayload = normalizeTemplatePayload({
        name: req.body.name || expense.title,
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        merchant: expense.merchant,
        note: expense.note,
        paymentMethod: expense.paymentMethod,
      });

      if (existingTemplate) {
        await prisma.expenseTemplate.update({
          where: {
            id: existingTemplate.id,
          },
          data: templatePayload,
        });
      } else {
        await prisma.expenseTemplate.create({
          data: {
            ...templatePayload,
            userId: req.user.id,
          },
        });
      }
    }

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const importExpenses = async (req, res) => {
  try {
    const rows = Array.isArray(req.body) ? req.body : [];
    const createdTransactions = [];
    const skippedTransactions = [];

    for (const rawRow of rows) {
      const row = {
        title: String(rawRow.title || rawRow.description || "").trim(),
        amount: Number(rawRow.amount || 0),
        date: rawRow.date ? new Date(rawRow.date) : new Date(),
        category: rawRow.category,
        merchant: rawRow.merchant,
        correctedMerchant: rawRow.correctedMerchant,
        paymentMethod: rawRow.paymentMethod,
        correctedCategory: rawRow.correctedCategory,
      };

      if (!row.title || Number.isNaN(row.amount) || row.amount <= 0) {
        skippedTransactions.push(row);
        continue;
      }

      const classification = await resolveExpenseClassification(req.user.id, row.title, row.merchant, row.category);
      const finalMerchant = row.correctedMerchant || row.merchant || classification.merchant || null;
      const finalCategory = row.correctedCategory || row.category || classification.category;

      const existingExpense = await prisma.expense.findFirst({
        where: {
          userId: req.user.id,
          title: classification.title,
          amount: row.amount,
          date: row.date,
        },
      });

      if (existingExpense) {
        skippedTransactions.push(row);
        continue;
      }

      const expense = await prisma.expense.create({
        data: {
          title: classification.title,
          amount: row.amount,
          category: finalCategory,
          merchant: finalMerchant,
          paymentMethod: row.paymentMethod || classification.paymentMethod || null,
          userId: req.user.id,
          date: row.date,
          importConfidence: classification.confidenceScore,
        },
      });

      if (row.correctedMerchant || row.correctedCategory) {
        await createOrUpdateCategoryRule(
          req.user.id,
          finalMerchant || classification.title,
          finalCategory
        );
      }

      createdTransactions.push(expense);
    }

    res.status(201).json({
      created: createdTransactions.length,
      skipped: skippedTransactions.length,
      transactions: createdTransactions,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getExpenses = async (req, res) => {
  try {
    await generateRecurringExpenses(req.user.id);

    const expenses = await prisma.expense.findMany({
      where: buildExpenseWhere(req.user.id, req.query),
      orderBy: {
        date: "desc",
      },
    });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateExpense = async (req, res) => {
  try {
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingExpense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    const payload = normalizePayload({
      ...existingExpense,
      ...req.body,
      isFavorite: req.body.isFavorite ?? existingExpense.isFavorite,
      importConfidence: req.body.importConfidence ?? existingExpense.importConfidence,
    });

    const expense = await prisma.expense.update({
      where: {
        id: existingExpense.id,
      },
      data: payload,
    });

    res.json(expense);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingExpense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    await prisma.expense.delete({
      where: {
        id: existingExpense.id,
      },
    });

    res.json({
      message: "Expense deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAnalytics = async (req, res) => {
  try {
    await generateRecurringExpenses(req.user.id);

    const { start, end } = parseDateRange(req.query);
    const dayCount = Math.max(1, Math.ceil((end.getTime() - start.getTime() + 1) / (24 * 60 * 60 * 1000)));
    const previousEnd = new Date(start);
    previousEnd.setDate(previousEnd.getDate() - 1);
    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousStart.getDate() - (dayCount - 1));

    const currentRangeQuery = buildRangeQuery(req.query, start, end);
    const previousRangeQuery = buildRangeQuery(req.query, previousStart, previousEnd);

    const [expenses, incomes, previousExpenses, previousIncomes] = await Promise.all([
      prisma.expense.findMany({
        where: buildExpenseWhere(req.user.id, currentRangeQuery),
        orderBy: {
          date: "asc",
        },
      }),
      prisma.income.findMany({
        where: buildIncomeWhere(req.user.id, currentRangeQuery),
        orderBy: {
          date: "asc",
        },
      }),
      prisma.expense.findMany({
        where: buildExpenseWhere(req.user.id, previousRangeQuery),
        orderBy: {
          date: "asc",
        },
      }),
      prisma.income.findMany({
        where: buildIncomeWhere(req.user.id, previousRangeQuery),
        orderBy: {
          date: "asc",
        },
      }),
    ]);

    const categoryMap = {};
    const monthMap = {};
    const weekMap = {};

    expenses.forEach((expense) => {
      categoryMap[expense.category] = (categoryMap[expense.category] || 0) + expense.amount;

      const monthKey = formatMonthKey(expense.date);
      monthMap[monthKey] = (monthMap[monthKey] || 0) + expense.amount;

      const weekKey = formatDateKey(getWeekStart(expense.date));
      weekMap[weekKey] = (weekMap[weekKey] || 0) + expense.amount;
    });

    const categories = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((left, right) => right.amount - left.amount);

    const monthsInRange = listMonthsBetween(start, end);
    const budgets = await prisma.budget.findMany({
      where: {
        userId: req.user.id,
        OR: monthsInRange,
      },
    });

    const totalExpenses = sumAmount(expenses);
    const totalIncome = sumAmount(incomes);
    const previousTotalExpenses = sumAmount(previousExpenses);
    const previousTotalIncome = sumAmount(previousIncomes);
    const baseBudget = budgets.reduce((sum, budget) => sum + Number(budget.amount || 0), 0);
    const effectiveBudget = baseBudget + totalIncome;
    const budgetUsage = effectiveBudget > 0 ? (totalExpenses / effectiveBudget) * 100 : 0;
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
    const previousNetSavings = previousTotalIncome - previousTotalExpenses;
    const previousSavingsRate = previousTotalIncome > 0 ? (previousNetSavings / previousTotalIncome) * 100 : 0;
    const topCategory = categories[0] || null;
    const largestExpense = expenses.reduce((largest, current) => {
      if (!largest || current.amount > largest.amount) {
        return current;
      }
      return largest;
    }, null);

    res.json({
      categories,
      monthlyTrend: buildTrendPoints(monthMap),
      weeklyTrend: buildTrendPoints(weekMap),
      topCategories: categories.slice(0, 5),
      topCategory,
      largestExpense,
      totalExpenses,
      totalIncome,
      budgetUsage,
      savingsRate,
      summary: {
        startDate: formatDateKey(start),
        endDate: formatDateKey(end),
        dayCount,
        baseBudget,
        effectiveBudget,
        income: totalIncome,
        expenses: totalExpenses,
        netSavings,
      },
      comparison: {
        previousStartDate: formatDateKey(previousStart),
        previousEndDate: formatDateKey(previousEnd),
        previousExpenses: previousTotalExpenses,
        previousIncome: previousTotalIncome,
        previousNetSavings,
        previousSavingsRate,
        expenseChange: totalExpenses - previousTotalExpenses,
        incomeChange: totalIncome - previousTotalIncome,
        savingsChange: netSavings - previousNetSavings,
        expenseChangePercent: calculatePercentageChange(totalExpenses, previousTotalExpenses),
        incomeChangePercent: calculatePercentageChange(totalIncome, previousTotalIncome),
        savingsRateChange: savingsRate - previousSavingsRate,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  importExpenses,
  getAnalytics,
};
