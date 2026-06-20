const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

const expenseRoutes = require("./routes/expenseRoutes");

const budgetRoutes =
  require("./routes/budgetRoutes");

  const recurringExpenseRoutes =
  require("./routes/recurringExpenseRoutes");

  const savingsGoalRoutes =
  require("./routes/savingsGoalRoutes");

  const savingsAllocationRoutes =
  require("./routes/savingsAllocationRoutes");

  const incomeRoutes =
  require("./routes/incomeRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/expenses", expenseRoutes);

app.use(
  "/api/budgets",
  budgetRoutes
);

app.use(
  "/api/recurring-expenses",
  recurringExpenseRoutes
);

app.use(
  "/api/savings-goals",
  savingsGoalRoutes
);

app.use(
  "/api/savings-allocation",
  savingsAllocationRoutes
);

app.use(
  "/api/income",
  incomeRoutes
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FlowSense API Running",
  });
});

module.exports = app;
