import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { removeFromCart, updateQty, clearCart } from "../store/cartSlice";
import toast from "react-hot-toast";

// ✅ Add isMobile after imports
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

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Get coupon & discount from Redux
  const { items, coupon, discount } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const totalPrice = items.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );
  const totalItems = items.reduce((acc, item) => acc + item.qty, 0);

  // ✅ finalTotal with discount
  const finalTotal = totalPrice - discount;

  const handleRemove = (id, name) => {
    dispatch(removeFromCart(id));
    toast.success(`${name} removed from cart`);
  };

  const handleQtyChange = (id, qty) => {
    if (qty < 1) return;
    dispatch(updateQty({ id, qty }));
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please login to checkout!");
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div
        style={{
          minHeight: "80vh",
          background: "#0f0f1a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
        }}
      >
        <div style={{ fontSize: "5rem" }}>🛒</div>
        <h2 style={{ color: "#fff", fontSize: "1.8rem", fontWeight: "800" }}>
          Your cart is empty
        </h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "15px" }}>
          Add some cricket gear to get started!
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
          Shop Now 🏏
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f1a",
        padding: isMobile ? "1rem" : "2rem",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* ✅ Responsive header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <h1
            style={{
              color: "#fff",
              fontSize: isMobile ? "1.5rem" : "2rem",
              fontWeight: "800",
            }}
          >
            🛒 Your Cart
            <span
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.4)",
                fontWeight: "normal",
                marginLeft: "12px",
              }}
            >
              ({totalItems} items)
            </span>
          </h1>
          <button
            onClick={() => {
              dispatch(clearCart());
              toast.success("Cart cleared");
            }}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,100,100,0.4)",
              color: "#ff6b6b",
              padding: "8px 18px",
              borderRadius: "50px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Clear Cart
          </button>
        </div>

        {/* ✅ Responsive main grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 340px",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* Cart Items */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {items.map((item) => (
              // ✅ Responsive cart item row
              <div
                key={item._id}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  padding: "1rem",
                  display: "flex",
                  alignItems: isMobile ? "flex-start" : "center",
                  gap: "1rem",
                  backdropFilter: "blur(12px)",
                  flexWrap: isMobile ? "wrap" : "nowrap",
                }}
              >
                {/* Product Image / Emoji */}
                <div
                  style={{
                    width: isMobile ? "60px" : "80px",
                    height: isMobile ? "60px" : "80px",
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isMobile ? "2rem" : "2.5rem",
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  {item.images?.[0]?.url ? (
                    <img
                      src={item.images[0].url}
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    getCategoryEmoji(item.category)
                  )}
                </div>

                {/* Product Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      color: "#fff",
                      fontSize: isMobile ? "13px" : "15px",
                      fontWeight: "700",
                      marginBottom: "4px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: isMobile ? "normal" : "nowrap",
                    }}
                  >
                    {item.name}
                  </h3>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "13px",
                      marginBottom: "8px",
                      textTransform: "capitalize",
                    }}
                  >
                    {item.brand} · {item.category}
                  </p>
                  <p
                    style={{
                      color: "#00d4aa",
                      fontWeight: "bold",
                      fontSize: "15px",
                    }}
                  >
                    Rs. {item.price}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "10px",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <button
                    onClick={() => handleQtyChange(item._id, item.qty - 1)}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "none",
                      color: "#fff",
                      padding: isMobile ? "6px 10px" : "8px 14px",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      color: "#fff",
                      padding: isMobile ? "6px 10px" : "8px 16px",
                      fontSize: "15px",
                      fontWeight: "bold",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    {item.qty}
                  </span>
                  <button
                    onClick={() => handleQtyChange(item._id, item.qty + 1)}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "none",
                      color: "#fff",
                      padding: isMobile ? "6px 10px" : "8px 14px",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    +
                  </button>
                </div>

                {/* ✅ Responsive item subtotal section */}
                <div
                  style={{
                    textAlign: isMobile ? "left" : "right",
                    minWidth: isMobile ? "auto" : "100px",
                    width: isMobile ? "100%" : "auto",
                    display: "flex",
                    flexDirection: isMobile ? "row" : "column",
                    justifyContent: isMobile ? "space-between" : "flex-start",
                    alignItems: "center",
                  }}
                >
                  <p
                    style={{
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "16px",
                      marginBottom: isMobile ? "0" : "8px",
                    }}
                  >
                    Rs. {item.price * item.qty}
                  </p>
                  <button
                    onClick={() => handleRemove(item._id, item.name)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#ff6b6b",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ Order Summary */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "20px",
              padding: isMobile ? "1.2rem" : "2rem",
              backdropFilter: "blur(12px)",
            }}
          >
            <h2
              style={{
                color: "#fff",
                fontSize: "1.2rem",
                fontWeight: "800",
                marginBottom: "1.5rem",
              }}
            >
              Order Summary
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span
                  style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}
                >
                  Subtotal ({totalItems} items)
                </span>
                <span style={{ color: "#fff", fontSize: "14px" }}>
                  Rs. {totalPrice}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span
                  style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}
                >
                  Shipping
                </span>
                <span style={{ color: "#4caf50", fontSize: "14px" }}>Free</span>
              </div>

              {/* ✅ Show coupon discount if applied */}
              {discount > 0 && coupon && (
                <div
                  style={{
                    background: "rgba(0,212,170,0.08)",
                    border: "1px solid rgba(0,212,170,0.2)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          color: "#00d4aa",
                          fontWeight: "bold",
                          fontSize: "13px",
                          letterSpacing: "1px",
                        }}
                      >
                        🎟️ {coupon.code}
                      </p>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.5)",
                          fontSize: "12px",
                        }}
                      >
                        You save Rs. {discount}!
                      </p>
                    </div>
                    <span
                      style={{
                        color: "#00d4aa",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      - Rs. {discount}
                    </span>
                  </div>
                </div>
              )}

              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  paddingTop: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "16px",
                  }}
                >
                  Total
                </span>
                <div style={{ textAlign: "right" }}>
                  {/* ✅ Strikethrough original price if discount applied */}
                  {discount > 0 && (
                    <p
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        fontSize: "13px",
                        textDecoration: "line-through",
                        marginBottom: "2px",
                      }}
                    >
                      Rs. {totalPrice}
                    </p>
                  )}
                  <span
                    style={{
                      color: "#00d4aa",
                      fontWeight: "bold",
                      fontSize: "20px",
                    }}
                  >
                    Rs. {finalTotal}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              style={{
                width: "100%",
                background: "#00d4aa",
                color: "#0f0f1a",
                border: "none",
                padding: "14px",
                borderRadius: "50px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                marginBottom: "1rem",
              }}
            >
              Proceed to Checkout →
            </button>

            <Link
              to="/products"
              style={{
                display: "block",
                textAlign: "center",
                color: "rgba(255,255,255,0.4)",
                textDecoration: "none",
                fontSize: "13px",
              }}
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
