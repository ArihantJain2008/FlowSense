const express = require("express");

const router = express.Router();

const {
  setBudget,
  getCurrentBudget,
  getBudgetSummary,
} = require("../controllers/budgetController");

const { protect } = require("../middleware/authMiddleware");


router.use(protect);

router.post("/", setBudget);

router.get(
  "/current",
  getCurrentBudget
);

router.get(
  "/summary",
  getBudgetSummary
);

module.exports = router;