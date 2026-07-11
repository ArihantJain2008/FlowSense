const express = require("express");

const router = express.Router();

const {
  getExpenseTemplates,
  createExpenseTemplate,
  updateExpenseTemplate,
  deleteExpenseTemplate,
} = require("../controllers/expenseTemplateController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
  .get(getExpenseTemplates)
  .post(createExpenseTemplate);

router.route("/:id")
  .put(updateExpenseTemplate)
  .delete(deleteExpenseTemplate);

module.exports = router;
