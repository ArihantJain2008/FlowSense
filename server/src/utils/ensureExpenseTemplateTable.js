const prisma = require("../lib/prisma");

const ensureExpenseTemplateTable = async () => {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ExpenseTemplate" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "category" TEXT NOT NULL,
        "merchant" TEXT,
        "note" TEXT,
        "paymentMethod" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "userId" TEXT NOT NULL
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ExpenseTemplate_userId_createdAt_idx"
      ON "ExpenseTemplate" ("userId", "createdAt")
    `);
  } catch (error) {
    if (!String(error.message).includes("already exists")) {
      throw error;
    }
  }
};

module.exports = { ensureExpenseTemplateTable };
