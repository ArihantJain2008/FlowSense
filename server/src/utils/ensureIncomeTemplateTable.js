const prisma = require("../lib/prisma");

const ensureIncomeTemplateTable = async () => {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "IncomeTemplate" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "source" TEXT,
        "merchant" TEXT,
        "note" TEXT,
        "paymentMethod" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "userId" TEXT NOT NULL
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "IncomeTemplate_userId_createdAt_idx"
      ON "IncomeTemplate" ("userId", "createdAt")
    `);
  } catch (error) {
    if (!String(error.message).includes("already exists")) {
      throw error;
    }
  }
};

module.exports = { ensureIncomeTemplateTable };
