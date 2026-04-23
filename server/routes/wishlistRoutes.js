const express = require("express");
const router = express.Router();
const {
  getWishlist,
  toggleWishlist,
  clearWishlist,
} = require("../controllers/wishlistController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getWishlist);
router.post("/toggle", protect, toggleWishlist);
router.delete("/clear", protect, clearWishlist);

module.exports = router;
