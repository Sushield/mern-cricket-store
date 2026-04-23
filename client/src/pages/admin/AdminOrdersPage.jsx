/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "../../utils/axios";
import toast from "react-hot-toast";

const AdminOrdersPage = () => {
  const { token } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(data.orders);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await axios.put(
        `/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(`Order status updated to ${status}!`);
      fetchOrders();
    } catch (error) {
      toast.error("Status update failed!");
    }
  };

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
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h1
          style={{
            color: "#fff",
            fontSize: "2rem",
            fontWeight: "800",
            marginBottom: "2rem",
          }}
        >
          📦 Manage Orders
        </h1>

        {loading ? (
          <p style={{ color: "#aaa" }}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "4rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📦</div>
            <p style={{ color: "rgba(255,255,255,0.4)" }}>No orders yet</p>
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
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "1.5rem",
                }}
              >
                {/* Order Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <p
                      style={{
                        color: "#00d4aa",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                      }}
                    >
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "13px",
                      }}
                    >
                      {order.user?.name || "N/A"} · {order.user?.email || ""}
                    </p>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        fontSize: "12px",
                      }}
                    >
                      {new Date(order.createdAt).toLocaleDateString()}
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

                {/* Order Items */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "10px",
                    padding: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  {order.orderItems.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom:
                          i < order.orderItems.length - 1 ? "8px" : "0",
                      }}
                    >
                      <span
                        style={{
                          color: "rgba(255,255,255,0.7)",
                          fontSize: "13px",
                        }}
                      >
                        {item.name} x{item.qty}
                      </span>
                      <span
                        style={{
                          color: "#fff",
                          fontSize: "13px",
                          fontWeight: "bold",
                        }}
                      >
                        Rs. {item.price * item.qty}
                      </span>
                    </div>
                  ))}
                  <div
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                      paddingTop: "8px",
                      marginTop: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ color: "#fff", fontWeight: "bold" }}>
                      Total
                    </span>
                    <span style={{ color: "#00d4aa", fontWeight: "bold" }}>
                      Rs. {order.totalPrice}
                    </span>
                  </div>
                </div>

                {/* Shipping Info */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "10px",
                    padding: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <p
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "11px",
                      marginBottom: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Shipping Address
                  </p>
                  <p style={{ color: "#fff", fontSize: "13px" }}>
                    {order.shippingAddress.fullName}
                  </p>
                  <p
                    style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}
                  >
                    {order.shippingAddress.address},{" "}
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.province}
                  </p>
                  <p
                    style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}
                  >
                    📞 {order.shippingAddress.phone}
                  </p>
                </div>

                {/* Status Update */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <p
                    style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}
                  >
                    Update Status:
                  </p>
                  {[
                    "pending",
                    "processing",
                    "shipped",
                    "delivered",
                    "cancelled",
                  ].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(order._id, status)}
                      disabled={order.status === status}
                      style={{
                        background:
                          order.status === status
                            ? `${statusColor(status)}33`
                            : "rgba(255,255,255,0.06)",
                        border: `1px solid ${
                          order.status === status
                            ? statusColor(status)
                            : "rgba(255,255,255,0.1)"
                        }`,
                        color:
                          order.status === status
                            ? statusColor(status)
                            : "rgba(255,255,255,0.5)",
                        padding: "6px 14px",
                        borderRadius: "50px",
                        cursor: order.status === status ? "default" : "pointer",
                        fontSize: "12px",
                        fontWeight: "bold",
                        textTransform: "capitalize",
                        transition: "all 0.2s",
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
