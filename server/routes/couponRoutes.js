const express = require("express");
const router = express.Router();
const {
  validateCoupon,
  applyCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/validate", protect, validateCoupon);
router.post("/apply", protect, applyCoupon);
router.get("/", protect, admin, getCoupons);
router.post("/", protect, admin, createCoupon);
router.put("/:id", protect, admin, updateCoupon);
router.delete("/:id", protect, admin, deleteCoupon);

module.exports = router;
