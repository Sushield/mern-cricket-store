const PreOrder = require("../models/PreOrder");
const Product = require("../models/Product");
const Order = require("../models/Order");
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

// POST /api/preorders
const createPreOrder = async (req, res) => {
  try {
    const { productId, qty, phone, message } = req.body;
    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const existing = await PreOrder.findOne({
      user: req.user._id,
      product: productId,
      status: "waiting",
    });
    if (existing)
      return res.status(400).json({
        success: false,
        message: "You already have a pre-order for this product!",
      });

    const preOrder = await PreOrder.create({
      user: req.user._id,
      product: productId,
      qty,
      phone,
      message,
    });

    await sendEmail(
      req.user.email,
      "✅ Pre-Order Confirmed — CricketGear",
      `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#00d4aa;">Pre-Order Confirmed!</h2>
        <p>Hi ${req.user.name},</p>
        <p>Your pre-order for <strong>${product.name}</strong> has been registered.</p>
        <p>We'll process your order automatically when stock is available!</p>
        <p><strong>Qty:</strong> ${qty}</p>
        <p><strong>Contact:</strong> ${phone}</p>
        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
      </div>`,
    );

    res.status(201).json({ success: true, preOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/preorders/my
const getMyPreOrders = async (req, res) => {
  try {
    const preOrders = await PreOrder.find({ user: req.user._id })
      .populate(
        "product",
        "name images price category brand discountedPrice isOnSale",
      )
      .populate("order", "_id status totalPrice")
      .sort({ createdAt: -1 });
    res.json({ success: true, preOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/preorders - Admin
const getAllPreOrders = async (req, res) => {
  try {
    const preOrders = await PreOrder.find({})
      .populate("user", "name email")
      .populate("product", "name images price stock category")
      .populate("order", "_id status")
      .sort({ createdAt: -1 });
    res.json({ success: true, preOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/preorders/:id/process - Admin processes preorder into real order
const processPreOrder = async (req, res) => {
  try {
    const preOrder = await PreOrder.findById(req.params.id)
      .populate("user", "name email")
      .populate("product");

    if (!preOrder)
      return res
        .status(404)
        .json({ success: false, message: "PreOrder not found" });
    if (preOrder.status === "fulfilled")
      return res
        .status(400)
        .json({ success: false, message: "Already fulfilled!" });

    const product = preOrder.product;
    if (product.stock < preOrder.qty) {
      return res.status(400).json({
        success: false,
        message: `Not enough stock! Only ${product.stock} available.`,
      });
    }

    // Reduce stock
    product.stock -= preOrder.qty;
    await product.save();

    // Create real order
    const order = await Order.create({
      user: preOrder.user._id,
      orderItems: [
        {
          name: product.name,
          qty: preOrder.qty,
          price: product.discountedPrice || product.price,
          product: product._id,
        },
      ],
      shippingAddress: {
        fullName: preOrder.user.name,
        phone: preOrder.phone,
        address: req.body.address || "To be confirmed",
        city: req.body.city || "To be confirmed",
        province: req.body.province || "To be confirmed",
      },
      totalPrice: (product.discountedPrice || product.price) * preOrder.qty,
      status: "processing",
    });

    // Update preorder
    preOrder.status = "fulfilled";
    preOrder.order = order._id;
    await preOrder.save();

    // Send email
    await sendEmail(
      preOrder.user.email,
      "🎉 Your Pre-Order is Confirmed! — CricketGear",
      `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#00d4aa;">Your Pre-Order is Processing!</h2>
        <p>Hi ${preOrder.user.name},</p>
        <p>Great news! Your pre-order for <strong>${product.name}</strong> has been processed!</p>
        <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
        <p><strong>Qty:</strong> ${preOrder.qty}</p>
        <p><strong>Total:</strong> Rs. ${order.totalPrice}</p>
        <p>Please contact us to confirm your shipping address.</p>
        <a href="${process.env.CLIENT_URL}/orders/${order._id}" 
          style="background:#00d4aa;color:#000;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:bold;display:inline-block;margin:1rem 0;">
          View Order 🏏
        </a>
      </div>`,
    );

    res.json({
      success: true,
      order,
      message: "Pre-order processed into real order!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/preorders/:id/notify - Admin notify user
const notifyPreOrder = async (req, res) => {
  try {
    const preOrder = await PreOrder.findById(req.params.id)
      .populate("user", "name email")
      .populate("product", "name price");

    if (!preOrder)
      return res
        .status(404)
        .json({ success: false, message: "PreOrder not found" });

    preOrder.status = "notified";
    await preOrder.save();

    await sendEmail(
      preOrder.user.email,
      "🎉 Product Back in Stock — CricketGear",
      `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#00d4aa;">Good News! 🎉</h2>
        <p>Hi ${preOrder.user.name},</p>
        <p><strong>${preOrder.product.name}</strong> is back in stock!</p>
        <p>Your pre-order will be processed shortly by our team.</p>
        <a href="${process.env.CLIENT_URL}/orders" 
          style="background:#00d4aa;color:#000;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:bold;display:inline-block;margin:1rem 0;">
          View My Orders 🏏
        </a>
      </div>`,
    );

    res.json({ success: true, message: "User notified!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/preorders/:id/cancel
const cancelPreOrder = async (req, res) => {
  try {
    const preOrder = await PreOrder.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: "cancelled" },
      { new: true },
    );
    if (!preOrder)
      return res
        .status(404)
        .json({ success: false, message: "PreOrder not found" });
    res.json({ success: true, message: "PreOrder cancelled!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPreOrder,
  getMyPreOrders,
  getAllPreOrders,
  processPreOrder,
  notifyPreOrder,
  cancelPreOrder,
};
