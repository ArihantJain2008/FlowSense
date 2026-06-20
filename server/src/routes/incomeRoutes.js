const express = require("express");

const router = express.Router();

const {
  createIncome,
  getIncome,
  deleteIncome,
} = require(
  "../controllers/incomeController"
);

const {
  protect,
} = require(
  "../middleware/authMiddleware"
);

router.use(protect);

router
  .route("/")
  .post(createIncome)
  .get(getIncome);

router
  .route("/:id")
  .delete(deleteIncome);

module.exports = router;