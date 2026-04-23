const express = require("express");
const router = express.Router();
const {
  updateProfile,
  changePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);

module.exports = router;
