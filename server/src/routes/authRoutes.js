const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  updateProfileSettings,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfileSettings);
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
