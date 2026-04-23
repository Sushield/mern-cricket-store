/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "../utils/axios";

const MyOrdersPage = () => {
  const { token } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get("/orders/myorders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(data.orders);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const statusColor = (status) => {
    const colors = {
      pending: "#ffc107",
      processing: "#2196f3",
      shipped: "#9c27b0",
      delivered: "#4caf50",
      cancelled: "#f44336",
    };
    return colors[status] || "#fff";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1
          style={{
            color: "#fff",
            fontSize: "2rem",
            fontWeight: "800",
            marginBottom: "2rem",
          }}
        >
          My Orders
        </h1>

        {loading ? (
          <p style={{ color: "#aaa" }}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "4rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📦</div>
            <h2 style={{ color: "#fff", marginBottom: "1rem" }}>
              No orders yet
            </h2>
            <Link
              to="/products"
              style={{
                background: "#00d4aa",
                color: "#0f0f1a",
                padding: "12px 28px",
                borderRadius: "50px",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Start Shopping 🏏
            </Link>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {orders.map((order) => (
              <div
                key={order._id}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: isMobile ? "flex-start" : "center",
                    flexDirection: isMobile ? "column" : "row",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "12px",
                        marginBottom: "4px",
                      }}
                    >
                      Order ID
                    </p>
                    <p
                      style={{
                        color: "#00d4aa",
                        fontFamily: "monospace",
                        fontSize: "14px",
                      }}
                    >
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <span
                    style={{
                      background: `${statusColor(order.status)}22`,
                      color: statusColor(order.status),
                      padding: "4px 14px",
                      borderRadius: "50px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      border: `1px solid ${statusColor(order.status)}44`,
                    }}
                  >
                    {order.status}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "12px",
                        marginBottom: "4px",
                      }}
                    >
                      Items
                    </p>
                    <p style={{ color: "#fff", fontSize: "14px" }}>
                      {order.orderItems.map((i) => i.name).join(", ")}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "12px",
                        marginBottom: "4px",
                      }}
                    >
                      Total
                    </p>
                    <p
                      style={{
                        color: "#00d4aa",
                        fontWeight: "bold",
                        fontSize: "18px",
                      }}
                    >
                      Rs. {order.totalPrice}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "1rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: isMobile ? "flex-start" : "center",
                    flexDirection: isMobile ? "column" : "row",
                    gap: "8px",
                  }}
                >
                  <p
                    style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}
                  >
                    {new Date(order.createdAt).toLocaleDateString("en-NP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <Link
                    to={`/orders/${order._id}`}
                    style={{
                      color: "#00d4aa",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
