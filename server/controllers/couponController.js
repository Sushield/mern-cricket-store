const Coupon = require("../models/Coupon");

const validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: "Invalid coupon code!" });

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon has expired!" });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon usage limit reached!" });
    }

    if (coupon.usedBy.includes(req.user._id)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You have already used this coupon!",
        });
    }

    if (orderTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is Rs. ${coupon.minOrderAmount}!`,
      });
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = Math.round((orderTotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, orderTotal);

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount,
      finalTotal: orderTotal - discount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found!" });

    coupon.usedCount += 1;
    coupon.usedBy.push(req.user._id);
    await coupon.save();

    res.json({ success: true, message: "Coupon applied!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
    );
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found!" });
    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found!" });
    res.json({ success: true, message: "Coupon deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  validateCoupon,
  applyCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
