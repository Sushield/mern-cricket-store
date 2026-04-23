const Wishlist = require("../models/Wishlist");

const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products",
    );
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const exists = wishlist.products.includes(productId);
    if (exists) {
      wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== productId,
      );
    } else {
      wishlist.products.push(productId);
    }

    await wishlist.save();
    res.json({
      success: true,
      added: !exists,
      count: wishlist.products.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const clearWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndUpdate({ user: req.user._id }, { products: [] });
    res.json({ success: true, message: "Wishlist cleared!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getWishlist, toggleWishlist, clearWishlist };
