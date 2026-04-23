const Product = require("../models/Product");

const getProducts = async (req, res) => {
  try {
    const { category, sort } = req.query;
    console.log("Category received:", category);
    const query = {};
    if (category && category !== "") query.category = category;
    console.log("Query:", query);
    let sortOption = { createdAt: -1 };
    if (sort === "price-asc") sortOption = { price: 1 };
    if (sort === "price-desc") sortOption = { price: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };
    const products = await Product.find(query).sort(sortOption);
    console.log("Products found:", products.length);
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const data = req.body;
    if (data.discountPercent > 0) {
      data.discountedPrice = Math.round(
        data.price - (data.price * data.discountPercent) / 100,
      );
      data.isOnSale = true;
    } else {
      data.discountedPrice = data.price;
      data.isOnSale = false;
    }
    const product = await Product.create(data);
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const data = req.body;
    if (data.discountPercent > 0) {
      data.discountedPrice = Math.round(
        data.price - (data.price * data.discountPercent) / 100,
      );
      data.isOnSale = true;
    } else {
      data.discountedPrice = Number(data.price);
      data.isOnSale = false;
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      { new: true, runValidators: false },
    );
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    // Check if already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString(),
    );
    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this product!",
      });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({
      success: true,
      reviews: product.reviews,
      rating: product.rating,
      numReviews: product.numReviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const review = product.reviews.find(
      (r) => r._id.toString() === req.params.reviewId,
    );
    if (!review)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });

    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized!" });
    }

    product.reviews = product.reviews.filter(
      (r) => r._id.toString() !== req.params.reviewId,
    );
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.length > 0
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) /
          product.reviews.length
        : 0;

    await product.save();
    res.json({
      success: true,
      reviews: product.reviews,
      rating: product.rating,
      numReviews: product.numReviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createReview,
  deleteReview,
};
