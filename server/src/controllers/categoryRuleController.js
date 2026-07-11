const prisma = require("../lib/prisma");

const getCategoryRules = async (req, res) => {
  try {
    const rules = await prisma.categoryRule.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(rules);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const createCategoryRule = async (req, res) => {
  try {
    const { pattern, normalizedMerchant, category } = req.body;
    const normalizedPattern = String(pattern || "").toLowerCase().trim();

    if (!normalizedPattern || !category) {
      return res.status(400).json({
        message: "Pattern and category are required.",
      });
    }

    const rule = await prisma.categoryRule.upsert({
      where: {
        userId_pattern: {
          userId: req.user.id,
          pattern: normalizedPattern,
        },
      },
      update: {
        normalizedMerchant,
        category,
      },
      create: {
        pattern: normalizedPattern,
        normalizedMerchant,
        category,
        userId: req.user.id,
      },
    });

    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getCategoryRules,
  createCategoryRule,
};
