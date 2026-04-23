// ProductDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/cartSlice";
import axios from "../utils/axios";
import toast from "react-hot-toast";
import { toggleWishlist } from "../store/wishlistSlice";

const isMobile = window.innerWidth <= 768;

// ─── Helpers ────────────────────────────────────────────────────────────────

const getCategoryEmoji = (category) => {
  const emojis = {
    bats: "🏏",
    balls: "🔴",
    pads: "🦺",
    gloves: "🧤",
    helmets: "⛑️",
    shoes: "👟",
    clothing: "👕",
    accessories: "🎒",
  };
  return emojis[category] || "🏏";
};

const getYouTubeId = (url) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : null;
};

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

// ─── Sub-components ──────────────────────────────────────────────────────────

const StarRating = ({ rating, interactive = false, size = "20px", onRate }) => {
  const [hover, setHover] = useState(0);

  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          style={{
            fontSize: size,
            cursor: interactive ? "pointer" : "default",
            color:
              star <= (interactive ? hover || rating : rating)
                ? "#ffd93d"
                : "rgba(255,255,255,0.2)",
            transition: "color 0.15s",
            userSelect: "none",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const ImageGallery = ({ images, category }) => {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div>
      {/* Main Image with mobile height */}
      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          borderRadius: "16px",
          overflow: "hidden",
          marginBottom: "1rem",
          position: "relative",
          height: isMobile ? "260px" : "350px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {images?.length > 0 ? (
          <img
            src={images[activeImage]?.url}
            alt={`Product image ${activeImage + 1}`}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <span style={{ fontSize: "8rem" }}>{getCategoryEmoji(category)}</span>
        )}
      </div>

      {/* Thumbnails */}
      {images?.length > 1 && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => setActiveImage(i)}
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "8px",
                overflow: "hidden",
                cursor: "pointer",
                border:
                  activeImage === i
                    ? "2px solid #00d4aa"
                    : "2px solid rgba(255,255,255,0.1)",
                transition: "border-color 0.2s",
              }}
            >
              <img
                src={img.url}
                alt={`Thumbnail ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PreOrderForm = ({ product, token, user, onSuccess }) => {
  const [show, setShow] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ qty: 1, phone: "", message: "" });

  const phoneRegex = /^9[0-9]{9}$/;

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please login first!");
      return;
    }
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      toast.error(
        "Please enter a valid 10-digit phone number (e.g. 98XXXXXXXX)!",
      );
      return;
    }
    if (formData.qty < 1) {
      toast.error("Quantity must be at least 1!");
      return;
    }
    try {
      setLoading(true);
      await axios.post(
        "/preorders",
        {
          productId: product._id,
          qty: formData.qty,
          phone: formData.phone,
          message: formData.message,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSubmitted(true);
      setShow(false);
      toast.success("Pre-order submitted! We'll notify you when available 🎉");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Pre-order failed!");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        style={{
          background: "rgba(76,175,80,0.1)",
          border: "1px solid rgba(76,175,80,0.3)",
          borderRadius: "12px",
          padding: "1rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "#4caf50",
            fontWeight: "bold",
            fontSize: "15px",
            marginBottom: "4px",
          }}
        >
          ✅ Pre-Order Submitted!
        </p>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
          We'll email you when this product is back in stock.
        </p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setShow((prev) => !prev)}
        style={{
          background: "rgba(255,217,61,0.15)",
          border: "1px solid rgba(255,217,61,0.4)",
          color: "#ffd93d",
          padding: "14px 32px",
          borderRadius: "50px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          width: "100%",
          marginBottom: "1rem",
        }}
      >
        📋 {show ? "Cancel Pre-Order" : "Pre-Order Now"}
      </button>

      {show && (
        <div
          style={{
            background: "rgba(255,217,61,0.05)",
            border: "1px solid rgba(255,217,61,0.2)",
            borderRadius: "16px",
            padding: "1.5rem",
            marginBottom: "1rem",
          }}
        >
          <p
            style={{
              color: "#ffd93d",
              fontWeight: "bold",
              fontSize: "14px",
              marginBottom: "1rem",
            }}
          >
            📋 Pre-Order Details
          </p>

          {/* Quantity */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={styles.inputLabel}>Quantity</label>
            {/* ✅ fontSize 16px prevents iOS zoom */}
            <input
              type="number"
              min="1"
              max="100"
              value={formData.qty}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  qty: Math.max(1, Math.min(100, Number(e.target.value) || 1)),
                })
              }
              style={{ ...styles.input, fontSize: "16px" }}
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={styles.inputLabel}>Phone Number *</label>
            {/* ✅ fontSize 16px prevents iOS zoom */}
            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="98XXXXXXXX"
              maxLength={10}
              style={{ ...styles.input, fontSize: "16px" }}
            />
          </div>

          {/* Message */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={styles.inputLabel}>Message (optional)</label>
            {/* ✅ fontSize 16px prevents iOS zoom */}
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Any special requirements..."
              style={{
                ...styles.input,
                fontSize: "16px",
                resize: "vertical",
                minHeight: "80px",
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              background: "#ffd93d",
              color: "#0f0f1a",
              border: "none",
              padding: "12px",
              borderRadius: "50px",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {loading ? "⏳ Submitting..." : "✅ Confirm Pre-Order"}
          </button>
        </div>
      )}
    </div>
  );
};

const ReviewForm = ({ productId, token, user, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating!");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a review comment!");
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.post(
        `/products/${productId}/reviews`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onReviewAdded(data);
      setRating(0);
      setComment("");
      toast.success("Review submitted! ⭐");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review!");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div
        style={{
          background: "rgba(0,212,170,0.08)",
          border: "1px solid rgba(0,212,170,0.2)",
          borderRadius: "12px",
          padding: "1rem",
          textAlign: "center",
          marginBottom: "2rem",
        }}
      >
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "14px",
            marginBottom: "10px",
          }}
        >
          Login to write a review
        </p>
        <Link
          to="/login"
          style={{
            background: "#00d4aa",
            color: "#0f0f1a",
            padding: "8px 24px",
            borderRadius: "50px",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "1.5rem",
        marginBottom: "2rem",
      }}
    >
      <h3
        style={{
          color: "#fff",
          fontSize: "1rem",
          fontWeight: "700",
          marginBottom: "1rem",
        }}
      >
        ✍️ Write a Review
      </h3>
      <form onSubmit={handleSubmit}>
        {/* Star Rating */}
        <div style={{ marginBottom: "1rem" }}>
          <p style={styles.fieldLabel}>Your Rating</p>
          <StarRating
            rating={rating}
            interactive
            size="32px"
            onRate={setRating}
          />
          {rating > 0 && (
            <p style={{ color: "#ffd93d", fontSize: "13px", marginTop: "6px" }}>
              {RATING_LABELS[rating]}
            </p>
          )}
        </div>

        {/* Comment */}
        <div style={{ marginBottom: "1rem" }}>
          <p style={styles.fieldLabel}>Your Review</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            placeholder="Share your experience with this product..."
            style={{
              ...styles.input,
              resize: "vertical",
              minHeight: "100px",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#ffd93d",
            color: "#0f0f1a",
            border: "none",
            padding: "10px 28px",
            borderRadius: "50px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            opacity: loading ? 0.7 : 1,
            transition: "opacity 0.2s",
          }}
        >
          {loading ? "Submitting..." : "⭐ Submit Review"}
        </button>
      </form>
    </div>
  );
};

const ReviewCard = ({ review, currentUser, productId, token, onDeleted }) => {
  const handleDelete = async () => {
    if (!window.confirm("Delete this review?")) return;
    try {
      const { data } = await axios.delete(
        `/products/${productId}/reviews/${review._id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onDeleted(data);
      toast.success("Review deleted!");
    } catch {
      toast.error("Failed to delete review!");
    }
  };

  const canDelete =
    currentUser?._id === review.user?.toString() ||
    currentUser?.role === "admin";

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "16px",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "10px",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {/* Reviewer Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "rgba(255,217,61,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffd93d",
              fontWeight: "bold",
              fontSize: "18px",
              flexShrink: 0,
            }}
          >
            {review.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p
              style={{
                color: "#fff",
                fontWeight: "bold",
                fontSize: "15px",
                marginBottom: "4px",
              }}
            >
              {review.name}
            </p>
            <StarRating rating={review.rating} size="16px" />
          </div>
        </div>

        {/* Date & Delete */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
            {new Date(review.createdAt).toLocaleDateString("en-NP", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
          {canDelete && (
            <button
              onClick={handleDelete}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,107,107,0.3)",
                color: "#ff6b6b",
                cursor: "pointer",
                fontSize: "12px",
                padding: "4px 10px",
                borderRadius: "20px",
                transition: "all 0.2s",
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Comment */}
      <p
        style={{
          color: "rgba(255,255,255,0.7)",
          fontSize: "14px",
          lineHeight: 1.6,
        }}
      >
        {review.comment}
      </p>
    </div>
  );
};

const RatingSummary = ({ overallRating, numReviews, reviews }) => (
  // ✅ Updated: flexDirection column on mobile
  <div
    style={{
      display: "flex",
      gap: "2rem",
      alignItems: "center",
      marginBottom: "2rem",
      flexDirection: isMobile ? "column" : "row",
      flexWrap: "wrap",
      padding: "1.5rem",
      background: "rgba(255,217,61,0.05)",
      border: "1px solid rgba(255,217,61,0.15)",
      borderRadius: "16px",
    }}
  >
    {/* Overall Score */}
    <div style={{ textAlign: "center", minWidth: "80px" }}>
      <p
        style={{
          color: "#ffd93d",
          fontSize: "3.5rem",
          fontWeight: "900",
          lineHeight: 1,
        }}
      >
        {overallRating.toFixed(1)}
      </p>
      <div style={{ margin: "6px 0" }}>
        <StarRating rating={overallRating} size="18px" />
      </div>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
        {numReviews} {numReviews === 1 ? "review" : "reviews"}
      </p>
    </div>

    {/* Rating Bars */}
    <div style={{ flex: 1, minWidth: "200px" }}>
      {[5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter(
          (r) => Math.round(r.rating) === star,
        ).length;
        const percent = numReviews > 0 ? (count / numReviews) * 100 : 0;
        return (
          <div
            key={star}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                color: "#ffd93d",
                fontSize: "13px",
                minWidth: "24px",
                textAlign: "right",
              }}
            >
              {star}★
            </span>
            <div
              style={{
                flex: 1,
                height: "8px",
                borderRadius: "4px",
                background: "rgba(255,255,255,0.1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: "4px",
                  background: "#ffd93d",
                  width: `${percent}%`,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            <span
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "12px",
                minWidth: "20px",
              }}
            >
              {count}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

// ─── Shared style objects ────────────────────────────────────────────────────

const styles = {
  input: {
    width: "100%",
    padding: "10px 14px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  inputLabel: {
    display: "block",
    color: "rgba(255,255,255,0.5)",
    fontSize: "12px",
    marginBottom: "6px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  fieldLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "12px",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
};

// ─── Main Page ───────────────────────────────────────────────────────────────

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState([]);
  const [overallRating, setOverallRating] = useState(0);
  const [numReviews, setNumReviews] = useState(0);

  const { user, token } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const isWishlisted = wishlistItems.includes(product?._id);

  // ── Fetch product ──
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/products/${id}`);
        setProduct(data.product);
        setReviews(data.product.reviews || []);
        setOverallRating(data.product.rating || 0);
        setNumReviews(data.product.numReviews || 0);
      } catch (error) {
        console.error(error);
        toast.error("Product not found!");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  // ── Handlers ──
  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, qty }));
    toast.success(`${product.name} added to cart! 🛒`);
  };

  const handleWishlistToggle = () => {
    if (!user) {
      toast.error("Please login to use wishlist!");
      return;
    }
    dispatch(toggleWishlist({ productId: product._id, token }));
    toast.success(
      isWishlisted ? "Removed from wishlist!" : "Added to wishlist! ❤️",
    );
  };

  const handleReviewAdded = (data) => {
    setReviews(data.reviews);
    setOverallRating(data.rating);
    setNumReviews(data.numReviews);
  };

  const handleReviewDeleted = (data) => {
    setReviews(data.reviews);
    setOverallRating(data.rating);
    setNumReviews(data.numReviews);
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f1a",
        }}
      >
        <p style={{ color: "#00d4aa", fontSize: "1.2rem" }}>
          Loading product...
        </p>
      </div>
    );
  }

  if (!product) return null;

  const finalPrice = product.discountedPrice || product.price;
  const hasDiscount = product.discountPercent > 0;
  const inStock = product.stock > 0;

  const tabs = [
    { key: "description", label: "📋 Description" },
    { key: "details", label: "🔧 Full Details" },
    { key: "videos", label: `🎥 Videos (${product.videos?.length || 0})` },
    { key: "reviews", label: `⭐ Reviews (${numReviews})` },
  ];

  return (
    <div
      style={{
        background: "#0f0f1a",
        minHeight: "100vh",
        padding: isMobile ? "1rem" : "2rem",
      }}
    >
      {/* ── Back button ── */}
      <button
        onClick={() => navigate("/products")}
        style={{
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "#fff",
          padding: "8px 20px",
          borderRadius: "50px",
          cursor: "pointer",
          marginBottom: "1.5rem",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        ← Back to Products
      </button>

      {/* ── Main grid ── */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? "1.5rem" : "3rem",
          marginBottom: "3rem",
        }}
      >
        {/* ── Left: Image Gallery ── */}
        <div style={{ position: "relative" }}>
          {/* Promo label */}
          {product.promoLabel && (
            <div
              style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                zIndex: 10,
                background: "#ff6b6b",
                color: "#fff",
                padding: "4px 12px",
                borderRadius: "50px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {product.promoLabel}
            </div>
          )}
          {/* Discount badge */}
          {hasDiscount && (
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                zIndex: 10,
                background: "#ffd93d",
                color: "#0f0f1a",
                padding: "4px 12px",
                borderRadius: "50px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {product.discountPercent}% OFF
            </div>
          )}
          <ImageGallery images={product.images} category={product.category} />
        </div>

        {/* ── Right: Product Info ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Category badge */}
          <span
            style={{
              display: "inline-block",
              background: "rgba(0,212,170,0.15)",
              color: "#00d4aa",
              padding: "4px 14px",
              borderRadius: "50px",
              fontSize: "12px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "1rem",
              width: "fit-content",
            }}
          >
            {product.category}
          </span>

          {/* Name */}
          <h1
            style={{
              color: "#fff",
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: "800",
              marginBottom: "0.5rem",
              lineHeight: 1.2,
            }}
          >
            {product.name}
          </h1>

          {/* Brand */}
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "14px",
              marginBottom: "1.5rem",
            }}
          >
            Brand: <span style={{ color: "#fff" }}>{product.brand}</span>
          </p>

          {/* Price */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <p
                style={{
                  color: "#00d4aa",
                  fontSize: "2rem",
                  fontWeight: "900",
                }}
              >
                Rs. {finalPrice}
              </p>
              {hasDiscount && (
                <>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: "1.2rem",
                      textDecoration: "line-through",
                    }}
                  >
                    Rs. {product.price}
                  </p>
                  <span
                    style={{
                      background: "rgba(255,217,61,0.15)",
                      color: "#ffd93d",
                      padding: "4px 12px",
                      borderRadius: "50px",
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  >
                    Save Rs. {product.price - finalPrice}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Stock status */}
          <p
            style={{
              color: inStock ? "#4caf50" : "#f44336",
              fontSize: "14px",
              marginBottom: "1rem",
              fontWeight: "bold",
            }}
          >
            {inStock
              ? `✓ In Stock (${product.stock} available)`
              : "✗ Out of Stock"}
          </p>

          {/* Short description */}
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "14px",
              lineHeight: 1.7,
              marginBottom: "2rem",
            }}
          >
            {product.description}
          </p>

          {/* ── In-stock actions ── */}
          {inStock ? (
            <>
              {/* Quantity selector */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
                  Quantity:
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "none",
                      color: "#fff",
                      padding: "8px 16px",
                      cursor: "pointer",
                      fontSize: "18px",
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      color: "#fff",
                      padding: "8px 20px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      background: "rgba(255,255,255,0.04)",
                      minWidth: "40px",
                      textAlign: "center",
                    }}
                  >
                    {qty}
                  </span>
                  <button
                    onClick={() =>
                      setQty((q) => Math.min(product.stock, q + 1))
                    }
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "none",
                      color: "#fff",
                      padding: "8px 16px",
                      cursor: "pointer",
                      fontSize: "18px",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                style={{
                  background: "#00d4aa",
                  color: "#0f0f1a",
                  border: "none",
                  padding: "14px 32px",
                  borderRadius: "50px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  width: "100%",
                  marginBottom: "1rem",
                  transition: "opacity 0.2s",
                }}
              >
                🛒 Add to Cart
              </button>

              {/* Wishlist (also available when in stock) */}
              <button
                onClick={handleWishlistToggle}
                style={{
                  width: "100%",
                  background: isWishlisted
                    ? "rgba(255,107,107,0.15)"
                    : "rgba(255,255,255,0.06)",
                  border: isWishlisted
                    ? "1px solid rgba(255,107,107,0.4)"
                    : "1px solid rgba(255,255,255,0.15)",
                  color: isWishlisted ? "#ff6b6b" : "rgba(255,255,255,0.6)",
                  padding: "12px",
                  borderRadius: "50px",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "bold",
                  transition: "all 0.3s",
                }}
              >
                {isWishlisted
                  ? "❤️ Remove from Wishlist"
                  : "🤍 Add to Wishlist"}
              </button>
            </>
          ) : (
            /* ── Out-of-stock actions ── */
            <div>
              <div
                style={{
                  background: "rgba(255,107,107,0.1)",
                  border: "1px solid rgba(255,107,107,0.3)",
                  borderRadius: "12px",
                  padding: "1rem",
                  marginBottom: "1rem",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    color: "#ff6b6b",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  ❌ Out of Stock
                </p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
                  Pre-order now and get notified when available!
                </p>
              </div>

              <PreOrderForm product={product} token={token} user={user} />

              {/* Wishlist for out-of-stock */}
              <button
                onClick={handleWishlistToggle}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  background: isWishlisted
                    ? "rgba(255,107,107,0.15)"
                    : "rgba(255,255,255,0.06)",
                  border: isWishlisted
                    ? "1px solid rgba(255,107,107,0.4)"
                    : "1px solid rgba(255,255,255,0.15)",
                  color: isWishlisted ? "#ff6b6b" : "rgba(255,255,255,0.6)",
                  padding: "12px",
                  borderRadius: "50px",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "bold",
                  transition: "all 0.3s",
                }}
              >
                {isWishlisted
                  ? "❤️ Remove from Wishlist"
                  : "🤍 Add to Wishlist"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Tab buttons */}
        <div
          style={{
            display: "flex",
            gap: "0",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            marginBottom: "2rem",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "12px 24px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color:
                  activeTab === tab.key ? "#00d4aa" : "rgba(255,255,255,0.4)",
                borderBottom:
                  activeTab === tab.key
                    ? "2px solid #00d4aa"
                    : "2px solid transparent",
                fontSize: "14px",
                fontWeight: activeTab === tab.key ? "bold" : "normal",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: isMobile ? "1rem" : "2rem",
            minHeight: "200px",
          }}
        >
          {/* Description Tab */}
          {activeTab === "description" && (
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "15px",
                lineHeight: 1.8,
              }}
            >
              {product.description}
            </p>
          )}

          {/* Details Tab */}
          {activeTab === "details" &&
            (product.details ? (
              <p
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "15px",
                  lineHeight: 1.8,
                  whiteSpace: "pre-line",
                }}
              >
                {product.details}
              </p>
            ) : (
              <p
                style={{
                  color: "rgba(255,255,255,0.3)",
                  textAlign: "center",
                  padding: "2rem",
                }}
              >
                No detailed specifications added yet.
              </p>
            ))}

          {/* Videos Tab */}
          {activeTab === "videos" &&
            (product.videos?.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                {product.videos.map((video, i) => {
                  const ytId = getYouTubeId(video.url);
                  return (
                    <div key={i}>
                      {ytId ? (
                        <iframe
                          width="100%"
                          height={isMobile ? "220" : "400"}
                          src={`https://www.youtube.com/embed/${ytId}`}
                          title={`Product video ${i + 1}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ borderRadius: "12px", display: "block" }}
                        />
                      ) : (
                        <video
                          controls
                          width="100%"
                          style={{
                            borderRadius: "12px",
                            maxHeight: isMobile ? "220px" : "400px",
                            display: "block",
                          }}
                        >
                          <source src={video.url} />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p
                style={{
                  color: "rgba(255,255,255,0.3)",
                  textAlign: "center",
                  padding: "2rem",
                }}
              >
                No videos added yet.
              </p>
            ))}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div>
              <RatingSummary
                overallRating={overallRating}
                numReviews={numReviews}
                reviews={reviews}
              />

              <ReviewForm
                productId={id}
                token={token}
                user={user}
                onReviewAdded={handleReviewAdded}
              />

              {reviews.length === 0 ? (
                <p
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    textAlign: "center",
                    padding: "2rem",
                  }}
                >
                  No reviews yet — be the first to review!
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {reviews.map((review) => (
                    <ReviewCard
                      key={review._id}
                      review={review}
                      currentUser={user}
                      productId={id}
                      token={token}
                      onDeleted={handleReviewDeleted}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
