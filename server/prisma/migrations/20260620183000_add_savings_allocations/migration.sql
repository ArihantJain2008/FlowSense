-- CreateTable
CREATE TABLE "SavingsAllocationBatch" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalAllocated" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SavingsAllocationBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavingsAllocation" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "goalId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,

    CONSTRAINT "SavingsAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavingsAllocationBatch_userId_month_year_key" ON "SavingsAllocationBatch"("userId", "month", "year");

-- AddForeignKey
ALTER TABLE "SavingsAllocationBatch" ADD CONSTRAINT "SavingsAllocationBatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsAllocation" ADD CONSTRAINT "SavingsAllocation_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "SavingsGoal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsAllocation" ADD CONSTRAINT "SavingsAllocation_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "SavingsAllocationBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
