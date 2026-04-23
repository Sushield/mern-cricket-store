const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ✅ ALL Routes TOGETHER - BEFORE error handler
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/players", require("./routes/playerRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/kyc", require("./routes/kycRoutes"));
app.use("/api/preorders", require("./routes/preOrderRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/coupons", require("./routes/couponRoutes")); // ✅ MOVED HERE

app.get("/", (req, res) => {
  res.json({ message: "CricketGear API is running!" });
});

// ✅ Error handler LAST - always
app.use((err, req, res, next) => {
  console.error("ERROR:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message,
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✓");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });
