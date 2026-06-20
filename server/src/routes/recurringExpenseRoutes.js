const express = require("express");

const router = express.Router();

const {
  createRecurringExpense,
  getRecurringExpenses,
  deleteRecurringExpense,
} = require("../controllers/recurringExpenseController");

const {
  protect,
} = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
  .post(
    createRecurringExpense
  )
  .get(
    getRecurringExpenses
  );

router.route("/:id")
  .delete(
    deleteRecurringExpense
  );

module.exports = router;