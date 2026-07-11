const prisma = require("../lib/prisma");
const { ensureExpenseTemplateTable } = require("../utils/ensureExpenseTemplateTable");
const { normalizeTemplatePayload } = require("../utils/expenseTemplatePayload");

ensureExpenseTemplateTable().catch(() => {});

const getExpenseTemplates = async (req, res) => {
  try {
    await ensureExpenseTemplateTable();

    const templates = await prisma.expenseTemplate.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createExpenseTemplate = async (req, res) => {
  try {
    await ensureExpenseTemplateTable();

    const payload = normalizeTemplatePayload(req.body);

    const template = await prisma.expenseTemplate.create({
      data: {
        ...payload,
        userId: req.user.id,
      },
    });

    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateExpenseTemplate = async (req, res) => {
  try {
    await ensureExpenseTemplateTable();

    const existingTemplate = await prisma.expenseTemplate.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    const payload = normalizeTemplatePayload({
      ...existingTemplate,
      ...req.body,
      amount: req.body.amount ?? existingTemplate.amount,
      name: req.body.name ?? existingTemplate.name,
      title: req.body.title ?? existingTemplate.title,
      category: req.body.category ?? existingTemplate.category,
      merchant: req.body.merchant ?? existingTemplate.merchant,
      note: req.body.note ?? existingTemplate.note,
      paymentMethod: req.body.paymentMethod ?? existingTemplate.paymentMethod,
    });

    const template = await prisma.expenseTemplate.update({
      where: {
        id: existingTemplate.id,
      },
      data: payload,
    });

    res.json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteExpenseTemplate = async (req, res) => {
  try {
    await ensureExpenseTemplateTable();

    const existingTemplate = await prisma.expenseTemplate.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    await prisma.expenseTemplate.delete({
      where: {
        id: existingTemplate.id,
      },
    });

    res.json({ message: "Template deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getExpenseTemplates,
  createExpenseTemplate,
  updateExpenseTemplate,
  deleteExpenseTemplate,
};
