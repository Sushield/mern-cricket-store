const express = require("express");
const router = express.Router();
const {
  createPreOrder,
  getMyPreOrders,
  getAllPreOrders,
  processPreOrder,
  notifyPreOrder,
  cancelPreOrder,
} = require("../controllers/preOrderController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/", protect, createPreOrder);
router.get("/my", protect, getMyPreOrders);
router.get("/", protect, admin, getAllPreOrders);
router.put("/:id/process", protect, admin, processPreOrder);
router.put("/:id/notify", protect, admin, notifyPreOrder);
router.put("/:id/cancel", protect, cancelPreOrder);

module.exports = router;
