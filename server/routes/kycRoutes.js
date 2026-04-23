const express = require("express");
const router = express.Router();
const {
  submitKYC,
  getMyKYC,
  getAllKYC,
  updateKYCStatus,
} = require("../controllers/kycController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/", protect, submitKYC);
router.get("/me", protect, getMyKYC);
router.get("/", protect, admin, getAllKYC);
router.put("/:id/status", protect, admin, updateKYCStatus);

module.exports = router;
