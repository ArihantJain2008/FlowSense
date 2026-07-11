ALTER TABLE "User"
ADD COLUMN "themePreference" TEXT NOT NULL DEFAULT 'system',
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN "notificationSettings" JSONB;

ALTER TABLE "Expense"
ADD COLUMN "merchant" TEXT,
ADD COLUMN "note" TEXT,
ADD COLUMN "paymentMethod" TEXT,
ADD COLUMN "isFavorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isRecurringGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "importConfidence" DOUBLE PRECISION,
ADD COLUMN "recurringExpenseId" TEXT;

ALTER TABLE "Income"
ADD COLUMN "note" TEXT,
ADD COLUMN "merchant" TEXT,
ADD COLUMN "paymentMethod" TEXT,
ADD COLUMN "isFavorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Income" SET "date" = "createdAt" WHERE "date" IS NULL;

ALTER TABLE "RecurringExpense"
ADD COLUMN "merchant" TEXT,
ADD COLUMN "note" TEXT,
ADD COLUMN "paymentMethod" TEXT,
ADD COLUMN "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "nextRunAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "lastGeneratedAt" TIMESTAMP(3),
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "dayOfMonth" INTEGER,
ADD COLUMN "dayOfWeek" INTEGER;

UPDATE "RecurringExpense" SET "nextRunAt" = "createdAt" WHERE "nextRunAt" IS NULL;
UPDATE "RecurringExpense" SET "startDate" = "createdAt" WHERE "startDate" IS NULL;

ALTER TABLE "SavingsGoal"
ADD COLUMN "monthlyContribution" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "targetDate" TIMESTAMP(3);

CREATE TABLE "CategoryRule" (
  "id" TEXT NOT NULL,
  "pattern" TEXT NOT NULL,
  "normalizedMerchant" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL,
  CONSTRAINT "CategoryRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MonthlySnapshot" (
  "id" TEXT NOT NULL,
  "month" INTEGER NOT NULL,
  "year" INTEGER NOT NULL,
  "income" DOUBLE PRECISION NOT NULL,
  "expenses" DOUBLE PRECISION NOT NULL,
  "savings" DOUBLE PRECISION NOT NULL,
  "budget" DOUBLE PRECISION NOT NULL,
  "budgetUsage" DOUBLE PRECISION NOT NULL,
  "savingsRate" DOUBLE PRECISION NOT NULL,
  "largestExpenseTitle" TEXT,
  "largestExpenseAmount" DOUBLE PRECISION,
  "topCategory" TEXT,
  "topCategoryAmount" DOUBLE PRECISION,
  "comparisonIncome" DOUBLE PRECISION,
  "comparisonExpenses" DOUBLE PRECISION,
  "comparisonSavings" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL,
  CONSTRAINT "MonthlySnapshot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CategoryRule_userId_pattern_key" ON "CategoryRule"("userId", "pattern");
CREATE UNIQUE INDEX "MonthlySnapshot_userId_month_year_key" ON "MonthlySnapshot"("userId", "month", "year");
CREATE INDEX "Expense_userId_date_idx" ON "Expense"("userId", "date");
CREATE INDEX "Expense_userId_category_idx" ON "Expense"("userId", "category");
CREATE INDEX "Expense_userId_isFavorite_idx" ON "Expense"("userId", "isFavorite");
CREATE INDEX "Income_userId_date_idx" ON "Income"("userId", "date");
CREATE INDEX "Income_userId_isFavorite_idx" ON "Income"("userId", "isFavorite");

ALTER TABLE "Expense"
ADD CONSTRAINT "Expense_recurringExpenseId_fkey"
FOREIGN KEY ("recurringExpenseId") REFERENCES "RecurringExpense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CategoryRule"
ADD CONSTRAINT "CategoryRule_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MonthlySnapshot"
ADD CONSTRAINT "MonthlySnapshot_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
