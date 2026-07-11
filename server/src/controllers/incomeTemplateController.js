const { randomUUID } = require("crypto");

const prisma = require("../lib/prisma");
const { ensureIncomeTemplateTable } = require("../utils/ensureIncomeTemplateTable");
const { normalizeIncomeTemplatePayload } = require("../utils/incomeTemplatePayload");

ensureIncomeTemplateTable().catch(() => {});

const getIncomeTemplates = async (req, res) => {
  try {
    await ensureIncomeTemplateTable();

    const templates = await prisma.$queryRawUnsafe(
      `
        SELECT *
        FROM "IncomeTemplate"
        WHERE "userId" = $1
        ORDER BY "createdAt" DESC
      `,
      req.user.id
    );

    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createIncomeTemplate = async (req, res) => {
  try {
    await ensureIncomeTemplateTable();

    const payload = normalizeIncomeTemplatePayload(req.body);
    const id = randomUUID();

    const [template] = await prisma.$queryRawUnsafe(
      `
        INSERT INTO "IncomeTemplate" (
          "id",
          "name",
          "title",
          "amount",
          "date",
          "source",
          "merchant",
          "note",
          "paymentMethod",
          "userId"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `,
      id,
      payload.name,
      payload.title,
      payload.amount,
      payload.date,
      payload.source,
      payload.merchant,
      payload.note,
      payload.paymentMethod,
      req.user.id
    );

    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateIncomeTemplate = async (req, res) => {
  try {
    await ensureIncomeTemplateTable();

    const existingTemplates = await prisma.$queryRawUnsafe(
      `
        SELECT *
        FROM "IncomeTemplate"
        WHERE "id" = $1 AND "userId" = $2
        LIMIT 1
      `,
      req.params.id,
      req.user.id
    );

    const existingTemplate = existingTemplates[0];

    if (!existingTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    const payload = normalizeIncomeTemplatePayload({
      ...existingTemplate,
      ...req.body,
      amount: req.body.amount ?? existingTemplate.amount,
      date: req.body.date ?? existingTemplate.date,
      name: req.body.name ?? existingTemplate.name,
      title: req.body.title ?? existingTemplate.title,
      source: req.body.source ?? existingTemplate.source,
      merchant: req.body.merchant ?? existingTemplate.merchant,
      note: req.body.note ?? existingTemplate.note,
      paymentMethod: req.body.paymentMethod ?? existingTemplate.paymentMethod,
    });

    const [template] = await prisma.$queryRawUnsafe(
      `
        UPDATE "IncomeTemplate"
        SET
          "name" = $1,
          "title" = $2,
          "amount" = $3,
          "date" = $4,
          "source" = $5,
          "merchant" = $6,
          "note" = $7,
          "paymentMethod" = $8,
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = $9
        RETURNING *
      `,
      payload.name,
      payload.title,
      payload.amount,
      payload.date,
      payload.source,
      payload.merchant,
      payload.note,
      payload.paymentMethod,
      existingTemplate.id
    );

    res.json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteIncomeTemplate = async (req, res) => {
  try {
    await ensureIncomeTemplateTable();

    const existingTemplates = await prisma.$queryRawUnsafe(
      `
        SELECT *
        FROM "IncomeTemplate"
        WHERE "id" = $1 AND "userId" = $2
        LIMIT 1
      `,
      req.params.id,
      req.user.id
    );

    const existingTemplate = existingTemplates[0];

    if (!existingTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    await prisma.$executeRawUnsafe(
      `
        DELETE FROM "IncomeTemplate"
        WHERE "id" = $1
      `,
      existingTemplate.id
    );

    res.json({ message: "Template deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getIncomeTemplates,
  createIncomeTemplate,
  updateIncomeTemplate,
  deleteIncomeTemplate,
};
