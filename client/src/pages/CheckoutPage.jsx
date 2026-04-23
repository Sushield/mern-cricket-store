import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart, applyCoupon, removeCoupon } from "../store/cartSlice";
import axios from "../utils/axios";
import toast from "react-hot-toast";

const isMobile = window.innerWidth <= 768;

const getCategoryEmoji = (category) => {
  const emojiMap = {
    Bats: "🏏",
    Balls: "⚪",
    Gloves: "🧤",
    Pads: "🛡️",
    Helmets: "🪖",
    Shoes: "👟",
    Bags: "🎒",
    default: "📦",
  };
  return emojiMap[category] || emojiMap["default"];
};

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    items,
    coupon: appliedCoupon,
    discount,
  } = useSelector((state) => state.cart);
  const { user, token } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [shippingData, setShippingData] = useState({
    fullName: user?.name || "",
    phone: "",
    address: "",
    city: "",
    province: "",
  });

  const totalPrice = items.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );
  const totalItems = items.reduce((acc, item) => acc + item.qty, 0);
  const finalTotal = totalPrice - discount;

  const handleShippingChange = (e) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    const { fullName, phone, address, city, province } = shippingData;
    if (!fullName || !phone || !address || !city || !province) {
      toast.error("Please fill all fields!");
      return;
    }
    setStep(2);
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setCouponLoading(true);
      const { data } = await axios.post(
        "/coupons/validate",
        { code: couponCode, orderTotal: totalPrice },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      dispatch(applyCoupon({ coupon: data.coupon, discount: data.discount }));
      toast.success(`Coupon applied! You save Rs. ${data.discount} 🎉`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid coupon!");
      dispatch(removeCoupon());
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setCouponCode("");
    toast.success("Coupon removed!");
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      const orderItems = items.map((item) => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
        product: item._id,
      }));

      const { data } = await axios.post(
        "/orders",
        {
          orderItems,
          shippingAddress: shippingData,
          totalPrice: finalTotal,
          originalPrice: totalPrice,
          discount: discount,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (appliedCoupon) {
        await axios.post(
          "/coupons/apply",
          { code: appliedCoupon.code },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      dispatch(clearCart());
      toast.success("Order placed successfully! 🎉");
      navigate(`/orders/${data.order._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Order failed!");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    color: "rgba(255,255,255,0.6)",
    fontSize: "13px",
    marginBottom: "6px",
    fontWeight: "500",
  };

  // Order Summary component used in both layouts
  const OrderSummary = () => (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "20px",
        padding: "1.5rem",
        backdropFilter: "blur(12px)",
        position: isMobile ? "static" : "sticky",
        top: "2rem",
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
        Order Summary
      </h3>

      {/* Items */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "1rem",
        }}
      >
        {items.map((item) => (
          <div
            key={item._id}
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
              {item.name} x{item.qty}
            </span>
            <span style={{ color: "#fff", fontSize: "13px" }}>
              Rs. {item.price * item.qty}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
            Subtotal ({totalItems} items)
          </span>
          <span style={{ color: "#fff", fontSize: "13px" }}>
            Rs. {totalPrice}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
            Shipping
          </span>
          <span style={{ color: "#4caf50", fontSize: "13px" }}>Free</span>
        </div>

        {/* Coupon Section */}
        {!appliedCoupon ? (
          <div style={{ marginBottom: "1rem" }}>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "12px",
                marginBottom: "6px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Coupon Code
            </p>
            <div style={{ display: "flex", gap: "6px" }}>
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter code..."
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                  letterSpacing: "2px",
                  fontWeight: "bold",
                }}
              />
              <button
                onClick={handleValidateCoupon}
                disabled={couponLoading}
                style={{
                  background: "#00d4aa",
                  color: "#0f0f1a",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  cursor: couponLoading ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  fontSize: "12px",
                  flexShrink: 0,
                }}
              >
                {couponLoading ? "..." : "Apply"}
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "rgba(0,212,170,0.1)",
              border: "1px solid rgba(0,212,170,0.3)",
              borderRadius: "10px",
              padding: "10px",
              marginBottom: "1rem",
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
                🎟️ {appliedCoupon.code}
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
            <button
              onClick={handleRemoveCoupon}
              style={{
                background: "transparent",
                border: "none",
                color: "#ff6b6b",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Discount Line */}
        {discount > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <span style={{ color: "#00d4aa", fontSize: "13px" }}>Discount</span>
            <span
              style={{
                color: "#00d4aa",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              - Rs. {discount}
            </span>
          </div>
        )}

        {/* Total */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: "10px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <span style={{ color: "#fff", fontWeight: "bold" }}>Total</span>
          <div style={{ textAlign: "right" }}>
            {discount > 0 && (
              <p
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: "12px",
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
                fontSize: "1.2rem",
              }}
            >
              Rs. {finalTotal}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", padding: "2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1
          style={{
            color: "#fff",
            fontSize: "2rem",
            fontWeight: "800",
            marginBottom: "2rem",
          }}
        >
          Checkout
        </h1>

        {/* Steps Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0",
            marginBottom: "2.5rem",
            overflowX: "auto",
          }}
        >
          {["Shipping", "Review Order"].map((s, i) => (
            <div
              key={s}
              style={{ display: "flex", alignItems: "center", flex: 1 }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background:
                      step >= i + 1 ? "#00d4aa" : "rgba(255,255,255,0.1)",
                    color: step >= i + 1 ? "#0f0f1a" : "rgba(255,255,255,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "14px",
                    flexShrink: 0,
                  }}
                >
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span
                  style={{
                    color: step >= i + 1 ? "#fff" : "rgba(255,255,255,0.3)",
                    fontSize: "14px",
                    fontWeight: step === i + 1 ? "bold" : "normal",
                  }}
                >
                  {s}
                </span>
              </div>
              {i < 1 && (
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: step > 1 ? "#00d4aa" : "rgba(255,255,255,0.1)",
                    margin: "0 16px",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 320px",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* On mobile: Order Summary shows first */}
          {isMobile && <OrderSummary />}

          {/* Left - Steps */}
          <div>
            {/* Step 1 - Shipping */}
            {step === 1 && (
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "20px",
                  padding: "2rem",
                }}
              >
                <h2
                  style={{
                    color: "#fff",
                    fontSize: "1.3rem",
                    fontWeight: "700",
                    marginBottom: "1.5rem",
                  }}
                >
                  📦 Shipping Address
                </h2>
                <form onSubmit={handleShippingSubmit}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div>
                      <label style={labelStyle}>Full Name</label>
                      <input
                        style={inputStyle}
                        name="fullName"
                        value={shippingData.fullName}
                        onChange={handleShippingChange}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone Number</label>
                      <input
                        style={inputStyle}
                        name="phone"
                        value={shippingData.phone}
                        onChange={handleShippingChange}
                        placeholder="98XXXXXXXX"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label style={labelStyle}>Street Address</label>
                    <input
                      style={inputStyle}
                      name="address"
                      value={shippingData.address}
                      onChange={handleShippingChange}
                      placeholder="Street address, area"
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: "1rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <div>
                      <label style={labelStyle}>City</label>
                      <input
                        style={inputStyle}
                        name="city"
                        value={shippingData.city}
                        onChange={handleShippingChange}
                        placeholder="Kathmandu"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Province</label>
                      <select
                        style={inputStyle}
                        name="province"
                        value={shippingData.province}
                        onChange={handleShippingChange}
                      >
                        <option value="">Select Province</option>
                        <option value="Koshi">Koshi</option>
                        <option value="Madhesh">Madhesh</option>
                        <option value="Bagmati">Bagmati</option>
                        <option value="Gandaki">Gandaki</option>
                        <option value="Lumbini">Lumbini</option>
                        <option value="Karnali">Karnali</option>
                        <option value="Sudurpashchim">Sudurpashchim</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
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
                    }}
                  >
                    Continue to Review →
                  </button>
                </form>
              </div>
            )}

            {/* Step 2 - Review */}
            {step === 2 && (
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "20px",
                  padding: "2rem",
                }}
              >
                <h2
                  style={{
                    color: "#fff",
                    fontSize: "1.3rem",
                    fontWeight: "700",
                    marginBottom: "1.5rem",
                  }}
                >
                  📋 Review Order
                </h2>

                {/* Shipping Summary */}
                <div
                  style={{
                    background: "rgba(0,212,170,0.08)",
                    border: "1px solid rgba(0,212,170,0.2)",
                    borderRadius: "12px",
                    padding: "1rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <p
                      style={{
                        color: "#00d4aa",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      📦 Shipping to
                    </p>
                    <button
                      onClick={() => setStep(1)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#00d4aa",
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                    >
                      Edit
                    </button>
                  </div>
                  <p style={{ color: "#fff", fontSize: "14px" }}>
                    {shippingData.fullName}
                  </p>
                  <p
                    style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}
                  >
                    {shippingData.address}, {shippingData.city},{" "}
                    {shippingData.province}
                  </p>
                  <p
                    style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}
                  >
                    📞 {shippingData.phone}
                  </p>
                </div>

                {/* Order Items */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginBottom: "1.5rem",
                  }}
                >
                  {items.map((item) => (
                    <div
                      key={item._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "10px",
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          background: "rgba(255,255,255,0.06)",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.5rem",
                          flexShrink: 0,
                        }}
                      >
                        {getCategoryEmoji(item.category)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            color: "#fff",
                            fontSize: "14px",
                            fontWeight: "600",
                          }}
                        >
                          {item.name}
                        </p>
                        <p
                          style={{
                            color: "rgba(255,255,255,0.4)",
                            fontSize: "12px",
                          }}
                        >
                          Qty: {item.qty}
                        </p>
                      </div>
                      <p
                        style={{
                          color: "#00d4aa",
                          fontWeight: "bold",
                          fontSize: "14px",
                        }}
                      >
                        Rs. {item.price * item.qty}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Coupon in Review */}
                {discount > 0 && (
                  <div
                    style={{
                      background: "rgba(0,212,170,0.08)",
                      border: "1px solid rgba(0,212,170,0.2)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      marginBottom: "1rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#00d4aa", fontSize: "14px" }}>
                      🎟️ Coupon ({appliedCoupon?.code}) Applied
                    </span>
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
                )}

                {/* Final Total */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                    marginBottom: "1.5rem",
                  }}
                >
                  <span
                    style={{
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                  >
                    Total to Pay
                  </span>
                  <div style={{ textAlign: "right" }}>
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
                        fontSize: "1.3rem",
                      }}
                    >
                      Rs. {finalTotal}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  style={{
                    width: "100%",
                    background: "#00d4aa",
                    color: "#0f0f1a",
                    border: "none",
                    padding: "14px",
                    borderRadius: "50px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading
                    ? "Placing Order..."
                    : `🎉 Place Order • Rs. ${finalTotal}`}
                </button>
              </div>
            )}
          </div>

          {/* Right - Order Summary (desktop only) */}
          {!isMobile && <OrderSummary />}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
