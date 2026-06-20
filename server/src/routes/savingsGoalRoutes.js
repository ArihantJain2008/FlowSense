const express = require("express");

const router = express.Router();

const {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
} = require("../controllers/savingsGoalController");

const {
  protect,
} = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
  .post(createGoal)
  .get(getGoals);

router.route("/:id")
  .put(updateGoal)
  .delete(deleteGoal);

module.exports = router;