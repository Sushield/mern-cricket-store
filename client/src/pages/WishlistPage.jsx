/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleWishlist, clearWishlistState } from "../store/wishlistSlice";
import { addToCart } from "../store/cartSlice";
import axios from "../utils/axios";
import toast from "react-hot-toast";

// ✅ Added isMobile
const isMobile = window.innerWidth <= 768;

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

const WishlistPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get("/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(data.wishlist.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [user, navigate, token]);

  const handleRemove = (productId) => {
    dispatch(toggleWishlist({ productId, token }));
    setProducts(products.filter((p) => p._id !== productId));
    toast.success("Removed from wishlist!");
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, qty: 1 }));
    toast.success(`${product.name} added to cart! 🛒`);
  };

  const handleClearAll = async () => {
    if (!window.confirm("Clear all wishlist items?")) return;
    try {
      await axios.delete("/wishlist/clear", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts([]);
      dispatch(clearWishlistState());
      toast.success("Wishlist cleared!");
    } catch (_err) {
      toast.error("Failed!");
    }
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", padding: "2rem" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                color: "#fff",
                fontSize: "2rem",
                fontWeight: "800",
                marginBottom: "4px",
              }}
            >
              ❤️ My Wishlist
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
              {products.length} {products.length === 1 ? "item" : "items"} saved
            </p>
          </div>
          {products.length > 0 && (
            <button
              onClick={handleClearAll}
              style={{
                background: "rgba(255,107,107,0.1)",
                border: "1px solid rgba(255,107,107,0.3)",
                color: "#ff6b6b",
                padding: "8px 20px",
                borderRadius: "50px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              Clear All
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", marginTop: "4rem" }}>
            <p style={{ color: "#00d4aa" }}>Loading wishlist...</p>
          </div>
        ) : products.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "5rem 2rem",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>💔</div>
            <h2
              style={{
                color: "#fff",
                fontSize: "1.5rem",
                fontWeight: "800",
                marginBottom: "1rem",
              }}
            >
              Your wishlist is empty
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                marginBottom: "2rem",
                fontSize: "15px",
              }}
            >
              Save your favourite cricket gear for later!
            </p>
            <Link
              to="/products"
              style={{
                background: "#00d4aa",
                color: "#0f0f1a",
                padding: "12px 32px",
                borderRadius: "50px",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "15px",
              }}
            >
              Browse Products 🏏
            </Link>
          </div>
        ) : (
          // ✅ Updated wishlist grid
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(2, 1fr)"
                : "repeat(auto-fill, minmax(240px, 1fr))",
              gap: isMobile ? "0.8rem" : "1.2rem",
            }}
          >
            {products.map((product) => (
              <div
                key={product._id}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0,212,170,0.3)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Image */}
                <div
                  style={{
                    height: "180px",
                    background: "rgba(255,255,255,0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: "4rem" }}>
                      {getCategoryEmoji(product.category)}
                    </span>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(product._id)}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "rgba(255,107,107,0.9)",
                      border: "none",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      cursor: "pointer",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                    }}
                  >
                    ✕
                  </button>

                  {/* Sale badge */}
                  {product.isOnSale && (
                    <span
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        background: "#ffd93d",
                        color: "#0f0f1a",
                        padding: "2px 8px",
                        borderRadius: "50px",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    >
                      {product.discountPercent}% OFF
                    </span>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: "1.2rem" }}>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "4px",
                    }}
                  >
                    {product.brand} · {product.category}
                  </p>
                  <h3
                    style={{
                      color: "#fff",
                      fontSize: "15px",
                      fontWeight: "700",
                      marginBottom: "8px",
                      lineHeight: 1.3,
                    }}
                  >
                    {product.name}
                  </h3>

                  {/* Rating */}
                  {product.numReviews > 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginBottom: "8px",
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          style={{
                            color:
                              star <= Math.round(product.rating)
                                ? "#ffd93d"
                                : "rgba(255,255,255,0.2)",
                            fontSize: "13px",
                          }}
                        >
                          ★
                        </span>
                      ))}
                      <span
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "11px",
                        }}
                      >
                        ({product.numReviews})
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "12px",
                    }}
                  >
                    <p
                      style={{
                        color: "#00d4aa",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                      }}
                    >
                      Rs. {product.discountedPrice || product.price}
                    </p>
                    {product.isOnSale && (
                      <p
                        style={{
                          color: "rgba(255,255,255,0.3)",
                          fontSize: "12px",
                          textDecoration: "line-through",
                        }}
                      >
                        Rs. {product.price}
                      </p>
                    )}
                  </div>

                  {/* Stock */}
                  <p
                    style={{
                      color: product.stock > 0 ? "#4caf50" : "#f44336",
                      fontSize: "12px",
                      marginBottom: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {product.stock > 0
                      ? `✓ In Stock (${product.stock})`
                      : "✗ Out of Stock"}
                  </p>

                  {/* Buttons */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    {product.stock > 0 ? (
                      <button
                        onClick={() => handleAddToCart(product)}
                        style={{
                          flex: 1,
                          background: "#00d4aa",
                          color: "#0f0f1a",
                          border: "none",
                          padding: "10px",
                          borderRadius: "50px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "13px",
                        }}
                      >
                        🛒 Add to Cart
                      </button>
                    ) : (
                      <Link
                        to={`/products/${product._id}`}
                        style={{
                          flex: 1,
                          background: "rgba(255,217,61,0.15)",
                          color: "#ffd93d",
                          border: "1px solid rgba(255,217,61,0.3)",
                          padding: "10px",
                          borderRadius: "50px",
                          textDecoration: "none",
                          fontWeight: "bold",
                          fontSize: "13px",
                          textAlign: "center",
                        }}
                      >
                        📋 Pre-Order
                      </Link>
                    )}
                    <Link
                      to={`/products/${product._id}`}
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.1)",
                        padding: "10px 14px",
                        borderRadius: "50px",
                        textDecoration: "none",
                        fontSize: "13px",
                      }}
                    >
                      👁️
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
