const express = require("express");

const router = express.Router();

const { getOverview } = require("../controllers/insightController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/overview", getOverview);

module.exports = router;
