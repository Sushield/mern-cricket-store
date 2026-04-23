const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    details: { type: String },
    price: { type: Number, required: true, default: 0 },
    discountPercent: { type: Number, default: 0 },
    discountedPrice: { type: Number, default: 0 },
    promoLabel: { type: String, default: "" },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    images: [{ url: String, public_id: String }],
    videos: [{ url: String, public_id: String }],
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isOnSale: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
