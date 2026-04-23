const mongoose = require("mongoose");

const preOrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    qty: { type: Number, required: true, default: 1 },
    phone: { type: String, required: true },
    message: { type: String },
    status: {
      type: String,
      enum: ["waiting", "notified", "fulfilled", "cancelled"],
      default: "waiting",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PreOrder", preOrderSchema);
