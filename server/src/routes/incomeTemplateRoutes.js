const express = require("express");

const router = express.Router();

const {
  getIncomeTemplates,
  createIncomeTemplate,
  updateIncomeTemplate,
  deleteIncomeTemplate,
} = require("../controllers/incomeTemplateController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
  .get(getIncomeTemplates)
  .post(createIncomeTemplate);

router.route("/:id")
  .put(updateIncomeTemplate)
  .delete(deleteIncomeTemplate);

module.exports = router;
