/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../utils/axios";
import { useSelector } from "react-redux";

// ✅ Added isMobile
const isMobile = window.innerWidth <= 768;

const OrderSuccessPage = () => {
  const { id } = useParams();
  const { token } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(data.order);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "80vh",
          background: "#0f0f1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#00d4aa" }}>Loading order...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f1a",
        padding: "3rem 2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Success icon */}
      <div
        style={{
          width: "100px",
          height: "100px",
          background: "rgba(0,212,170,0.15)",
          border: "2px solid #00d4aa",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "3rem",
          marginBottom: "1.5rem",
        }}
      >
        🎉
      </div>

      <h1
        style={{
          color: "#fff",
          fontSize: "2rem",
          fontWeight: "800",
          marginBottom: "0.5rem",
          textAlign: "center",
        }}
      >
        Order Placed Successfully!
      </h1>
      <p
        style={{
          color: "rgba(255,255,255,0.5)",
          marginBottom: "2rem",
          textAlign: "center",
        }}
      >
        Thank you for shopping with CricketGear 🏏
      </p>

      {order && (
        // ✅ Updated order card
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            padding: isMobile ? "1.2rem" : "2rem",
            width: "100%",
            maxWidth: "600px",
            marginBottom: "2rem",
          }}
        >
          {/* Order ID */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
              Order ID
            </span>
            <span
              style={{
                color: "#00d4aa",
                fontSize: "13px",
                fontFamily: "monospace",
              }}
            >
              #{order._id.slice(-8).toUpperCase()}
            </span>
          </div>

          {/* Status */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
              Status
            </span>
            <span
              style={{
                background: "rgba(255,193,7,0.15)",
                color: "#ffc107",
                padding: "3px 12px",
                borderRadius: "50px",
                fontSize: "12px",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {order.status}
            </span>
          </div>

          {/* Shipping */}
          <div
            style={{
              marginBottom: "1rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "13px",
                marginBottom: "6px",
              }}
            >
              Shipping to
            </p>
            <p style={{ color: "#fff", fontSize: "14px" }}>
              {order.shippingAddress.fullName}
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
              {order.shippingAddress.address}, {order.shippingAddress.city}
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
              📞 {order.shippingAddress.phone}
            </p>
          </div>

          {/* Items */}
          <div
            style={{
              marginBottom: "1rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "13px",
                marginBottom: "10px",
              }}
            >
              Items ordered
            </p>
            {order.orderItems.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <span style={{ color: "#fff", fontSize: "14px" }}>
                  {item.name} x{item.qty}
                </span>
                <span style={{ color: "#00d4aa", fontSize: "14px" }}>
                  Rs. {item.price * item.qty}
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span
              style={{ color: "#fff", fontWeight: "bold", fontSize: "16px" }}
            >
              Total
            </span>
            <span
              style={{ color: "#00d4aa", fontWeight: "bold", fontSize: "20px" }}
            >
              Rs. {order.totalPrice}
            </span>
          </div>
        </div>
      )}

      {/* ✅ Updated bottom buttons */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexDirection: isMobile ? "column" : "row",
          flexWrap: "wrap",
          justifyContent: "center",
          width: isMobile ? "100%" : "auto",
        }}
      >
        <Link
          to="/orders"
          style={{
            background: "#00d4aa",
            color: "#0f0f1a",
            padding: "12px 28px",
            borderRadius: "50px",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "15px",
            textAlign: "center",
          }}
        >
          View My Orders
        </Link>
        <Link
          to="/products"
          style={{
            background: "transparent",
            color: "#fff",
            padding: "12px 28px",
            borderRadius: "50px",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "15px",
            textAlign: "center",
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
