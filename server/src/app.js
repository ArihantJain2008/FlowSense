const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

const expenseRoutes = require("./routes/expenseRoutes");

const budgetRoutes =
  require("./routes/budgetRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/expenses", expenseRoutes);

app.use(
  "/api/budgets",
  budgetRoutes
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FlowSense API Running",
  });
});

module.exports = app;