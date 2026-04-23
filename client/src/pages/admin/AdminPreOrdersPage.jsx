/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "../../utils/axios";
import toast from "react-hot-toast";

const AdminPreOrdersPage = () => {
  const { token } = useSelector((state) => state.auth);
  const [preOrders, setPreOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchPreOrders();
  }, []);

  const fetchPreOrders = async () => {
    try {
      const { data } = await axios.get("/preorders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPreOrders(data.preOrders);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotify = async (id) => {
    try {
      await axios.put(
        `/preorders/${id}/notify`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("User notified via email!");
      fetchPreOrders();
    } catch (error) {
      toast.error("Failed to notify!");
    }
  };

  const handleProcess = async (id) => {
    try {
      await axios.put(
        `/preorders/${id}/process`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Order processed successfully!");
      fetchPreOrders();
    } catch (error) {
      toast.error("Failed to process order!");
    }
  };

  const statusColor = (status) => {
    const colors = {
      waiting: "#ffc107",
      notified: "#2196f3",
      fulfilled: "#4caf50",
      cancelled: "#f44336",
    };
    return colors[status] || "#fff";
  };

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

  const filtered =
    filter === "all" ? preOrders : preOrders.filter((p) => p.status === filter);

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
          📋 Pre-Orders
        </h1>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {[
            { label: "Total", value: preOrders.length, color: "#a29bfe" },
            {
              label: "Waiting",
              value: preOrders.filter((p) => p.status === "waiting").length,
              color: "#ffc107",
            },
            {
              label: "Notified",
              value: preOrders.filter((p) => p.status === "notified").length,
              color: "#2196f3",
            },
            {
              label: "Fulfilled",
              value: preOrders.filter((p) => p.status === "fulfilled").length,
              color: "#4caf50",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${stat.color}33`,
                borderLeft: `3px solid ${stat.color}`,
                borderRadius: "12px",
                padding: "1rem",
              }}
            >
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "12px",
                  marginBottom: "4px",
                }}
              >
                {stat.label}
              </p>
              <p style={{ color: "#fff", fontSize: "2rem", fontWeight: "800" }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {["all", "waiting", "notified", "fulfilled", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? "#00d4aa" : "rgba(255,255,255,0.06)",
                border:
                  filter === f ? "none" : "1px solid rgba(255,255,255,0.1)",
                color: filter === f ? "#0f0f1a" : "rgba(255,255,255,0.6)",
                padding: "8px 20px",
                borderRadius: "50px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: filter === f ? "bold" : "normal",
                textTransform: "capitalize",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <p style={{ color: "#aaa" }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "16px",
            }}
          >
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</p>
            <p style={{ color: "rgba(255,255,255,0.4)" }}>No pre-orders yet</p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {filtered.map((preOrder) => (
              <div
                key={preOrder._id}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  display: "flex",
                  gap: "1.5rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {/* Product Image */}
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {preOrder.product?.images?.[0]?.url ? (
                    <img
                      src={preOrder.product.images[0].url}
                      alt={preOrder.product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: "2rem" }}>
                      {getCategoryEmoji(preOrder.product?.category)}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: "15px",
                          marginBottom: "2px",
                        }}
                      >
                        {preOrder.product?.name}
                      </p>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "13px",
                        }}
                      >
                        Rs. {preOrder.product?.price} · Qty: {preOrder.qty}
                      </p>
                    </div>
                    <span
                      style={{
                        background: `${statusColor(preOrder.status)}22`,
                        color: statusColor(preOrder.status),
                        padding: "4px 14px",
                        borderRadius: "50px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        border: `1px solid ${statusColor(preOrder.status)}44`,
                        height: "fit-content",
                      }}
                    >
                      {preOrder.status}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "1.5rem",
                      flexWrap: "wrap",
                      marginBottom: "8px",
                    }}
                  >
                    <p
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "13px",
                      }}
                    >
                      👤 {preOrder.user?.name} · {preOrder.user?.email}
                    </p>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "13px",
                      }}
                    >
                      📞 {preOrder.phone}
                    </p>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        fontSize: "12px",
                      }}
                    >
                      📅 {new Date(preOrder.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {preOrder.message && (
                    <p
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "13px",
                        fontStyle: "italic",
                      }}
                    >
                      💬 {preOrder.message}
                    </p>
                  )}
                  <p
                    style={{
                      color:
                        preOrder.product?.stock > 0 ? "#4caf50" : "#f44336",
                      fontSize: "13px",
                      marginTop: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    {preOrder.product?.stock > 0
                      ? `✓ Back in stock! (${preOrder.product.stock} available)`
                      : "✗ Still out of stock"}
                  </p>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    flexShrink: 0,
                  }}
                >
                  {preOrder.status === "waiting" && (
                    <>
                      <button
                        onClick={() => handleNotify(preOrder._id)}
                        style={{
                          background: "rgba(33,150,243,0.15)",
                          border: "1px solid rgba(33,150,243,0.4)",
                          color: "#2196f3",
                          padding: "8px 16px",
                          borderRadius: "50px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        📧 Notify User
                      </button>
                      {preOrder.product?.stock >= preOrder.qty && (
                        <button
                          onClick={() => handleProcess(preOrder._id)}
                          style={{
                            background: "rgba(76,175,80,0.15)",
                            border: "1px solid rgba(76,175,80,0.4)",
                            color: "#4caf50",
                            padding: "8px 16px",
                            borderRadius: "50px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          ⚡ Process Order
                        </button>
                      )}
                    </>
                  )}
                  {preOrder.status === "notified" && (
                    <>
                      <span
                        style={{
                          color: "rgba(255,255,255,0.3)",
                          fontSize: "12px",
                        }}
                      >
                        Email sent ✓
                      </span>
                      {preOrder.product?.stock >= preOrder.qty && (
                        <button
                          onClick={() => handleProcess(preOrder._id)}
                          style={{
                            background: "rgba(76,175,80,0.15)",
                            border: "1px solid rgba(76,175,80,0.4)",
                            color: "#4caf50",
                            padding: "8px 16px",
                            borderRadius: "50px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          ⚡ Process Order
                        </button>
                      )}
                    </>
                  )}
                  {preOrder.status === "fulfilled" && (
                    <span
                      style={{
                        color: "#4caf50",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      ✅ Order Created
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPreOrdersPage;
