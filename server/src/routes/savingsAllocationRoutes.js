const express = require("express");

const {
  getSavingsAllocationSummary,
  allocateSavings,
} = require("../controllers/savingsAllocationController");
const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get(
  "/summary",
  getSavingsAllocationSummary
);
router.post(
  "/allocate",
  allocateSavings
);

module.exports = router;
