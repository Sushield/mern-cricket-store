const Order = require("../models/Order");
const Product = require("../models/Product");
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({
    from: `CricketGear <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

// POST /api/orders - Create order
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items",
      });
    }

    // Check stock and reduce
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.name} not found`,
        });
      }
      if (product.stock < item.qty) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available for ${product.name}`,
        });
      }
      // Reduce stock
      product.stock -= item.qty;
      await product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      totalPrice,
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/orders/myorders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders - Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/orders/:id/status - Admin
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    const prevStatus = order.status;
    order.status = req.body.status;

    if (req.body.status === "delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    // If cancelled restore stock
    if (req.body.status === "cancelled" && prevStatus !== "cancelled") {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.qty },
        });
      }
      // Send cancellation email
      await sendEmail(
        order.user.email,
        "❌ Order Cancelled — CricketGear",
        `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#f44336;">Order Cancelled</h2>
          <p>Hi ${order.user.name},</p>
          <p>Your order <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong> has been cancelled.</p>
          <p>Stock has been restored.</p>
          <a href="${process.env.CLIENT_URL}/products" style="background:#00d4aa;color:#000;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:bold;display:inline-block;margin:1rem 0;">
            Shop Again 🏏
          </a>
        </div>`,
      );
    }

    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
