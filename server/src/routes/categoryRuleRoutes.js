const express = require("express");

const router = express.Router();

const { getCategoryRules, createCategoryRule } = require("../controllers/categoryRuleController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getCategoryRules);
router.post("/", createCategoryRule);

module.exports = router;
