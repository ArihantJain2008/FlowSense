const express = require("express");

const router = express.Router();

const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getAnalytics
} = require("../controllers/expenseController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get(
  "/analytics",
  getAnalytics
);

router.route("/")
  .post(createExpense)
  .get(getExpenses);

router.route("/:id")
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;