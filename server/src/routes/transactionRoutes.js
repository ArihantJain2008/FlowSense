const express = require("express");

const router = express.Router();

const { getTransactions, recreateFavorite } = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getTransactions);
router.post("/favorites/recreate", recreateFavorite);

module.exports = router;
