import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "../../utils/axios";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { token } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch data in parallel
        const [productsRes, ordersRes] = await Promise.all([
          axios.get("/products"),
          axios.get("/orders", { headers }),
        ]);

        const orders = ordersRes.data.orders || [];
        const totalRevenue = orders.reduce((acc, order) => {
          return acc + (Number(order.totalPrice) || 0);
        }, 0);
        const pendingOrders = orders.filter(
          (o) => o.status === "pending",
        ).length;

        setStats({
          totalProducts: productsRes.data.count || 0,
          totalOrders: orders.length,
          totalRevenue,
          pendingOrders,
        });

        // Sort orders by date (newest first) and take first 5
        const sortedOrders = [...orders].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setRecentOrders(sortedOrders.slice(0, 5));

        if (isRefresh) {
          toast.success("Dashboard refreshed!");
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        const errorMessage =
          err.response?.data?.message || "Failed to load dashboard data";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token, fetchStats]);

  const handleRefresh = () => {
    fetchStats(true);
  };

  const statusColor = useCallback((status) => {
    const colors = {
      pending: "#ffc107",
      processing: "#2196f3",
      shipped: "#9c27b0",
      delivered: "#4caf50",
      cancelled: "#f44336",
    };
    return colors[status?.toLowerCase()] || "#888";
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("NPR", "Rs.");
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Intl.DateTimeFormat("en-NP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  }, []);

  const statCards = useMemo(
    () => [
      {
        label: "Total Products",
        value: stats.totalProducts,
        emoji: "🏏",
        color: "#00d4aa",
        link: "/admin/products",
      },
      {
        label: "Total Orders",
        value: stats.totalOrders,
        emoji: "📦",
        color: "#a29bfe",
        link: "/admin/orders",
      },
      {
        label: "Total Revenue",
        value: formatCurrency(stats.totalRevenue),
        emoji: "💰",
        color: "#ffd93d",
        link: "/admin/orders",
      },
      {
        label: "Pending Orders",
        value: stats.pendingOrders,
        emoji: "⏳",
        color: "#ff6b6b",
        link: "/admin/orders?status=pending",
      },
    ],
    [stats, formatCurrency],
  );

  const quickLinks = useMemo(
    () => [
      {
        label: "Manage Products",
        emoji: "🏏",
        to: "/admin/products",
        color: "#00d4aa",
      },
      {
        label: "Manage Orders",
        emoji: "📦",
        to: "/admin/orders",
        color: "#a29bfe",
      },
      {
        label: "Manage Players",
        emoji: "👑",
        to: "/admin/players",
        color: "#ffd93d",
      },
      {
        label: "Manage Categories",
        emoji: "🏪",
        to: "/admin/categories",
        color: "#ff6b6b",
      },
      {
        label: "Manage Blog",
        emoji: "📝",
        to: "/admin/blog",
        color: "#00d4aa",
      },
      {
        label: "KYC Verification",
        emoji: "🪪",
        to: "/admin/kyc",
        color: "#00d4aa",
      },
      {
        label: "Pre-Orders",
        emoji: "📋",
        to: "/admin/preorders",
        color: "#ffd93d",
      },
      { label: "Coupons", emoji: "🎟️", to: "/admin/coupons", color: "#ffd93d" },
    ],
    [],
  );

  // Memoized styles
  const styles = useMemo(
    () => ({
      container: {
        minHeight: "100vh",
        background: "#0f0f1a",
        padding: "2rem",
      },
      card: {
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "1.5rem",
        transition: "all 0.3s ease",
      },
      button: {
        background: "#00d4aa",
        color: "#0f0f1a",
        padding: "10px 20px",
        borderRadius: "50px",
        textDecoration: "none",
        fontWeight: "bold",
        fontSize: "14px",
        border: "none",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "inline-block",
      },
      secondaryButton: {
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.15)",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: "50px",
        textDecoration: "none",
        fontSize: "14px",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "inline-block",
      },
    }),
    [],
  );

  if (loading && !refreshing) {
    return (
      <div style={styles.container}>
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "4px solid rgba(0,212,170,0.3)",
              borderTop: "4px solid #00d4aa",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ color: "#aaa", marginTop: "1rem", fontSize: "14px" }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div style={styles.container}>
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            textAlign: "center",
            padding: "4rem 2rem",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⚠️</div>
          <h2
            style={{
              color: "#ff6b6b",
              fontSize: "1.5rem",
              marginBottom: "1rem",
            }}
          >
            Error Loading Dashboard
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "2rem" }}>
            {error}
          </p>
          <button
            onClick={handleRefresh}
            style={styles.button}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
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
                margin: 0,
                marginBottom: "0.25rem",
              }}
            >
              Admin Dashboard
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "14px",
                margin: 0,
              }}
            >
              Manage your CricketGear store
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                ...styles.secondaryButton,
                opacity: refreshing ? 0.6 : 1,
                cursor: refreshing ? "not-allowed" : "pointer",
              }}
              aria-label="Refresh dashboard"
            >
              {refreshing ? "🔄 Refreshing..." : "🔄 Refresh"}
            </button>
            <Link
              to="/admin/products"
              style={styles.button}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-2px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              + Add Product
            </Link>
            <Link
              to="/admin/orders"
              style={styles.secondaryButton}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-2px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              Manage Orders
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {statCards.map((card) => (
            <Link
              key={card.label}
              to={card.link}
              style={{
                ...styles.card,
                borderLeft: `3px solid ${card.color}`,
                textDecoration: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = card.color;
                e.currentTarget.style.boxShadow = `0 8px 24px ${card.color}22`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.boxShadow = "none";
              }}
              aria-label={`${card.label}: ${card.value}`}
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
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "13px",
                      marginBottom: "8px",
                      margin: 0,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontWeight: "600",
                    }}
                  >
                    {card.label}
                  </p>
                  <p
                    style={{
                      color: "#fff",
                      fontSize: "1.8rem",
                      fontWeight: "800",
                      margin: 0,
                    }}
                  >
                    {card.value}
                  </p>
                </div>
                <div style={{ fontSize: "2.5rem" }} aria-hidden="true">
                  {card.emoji}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              style={{
                background: `${link.color}11`,
                border: `1px solid ${link.color}33`,
                borderRadius: "16px",
                padding: "1.5rem",
                textDecoration: "none",
                textAlign: "center",
                transition: "all 0.3s",
                display: "block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${link.color}22`;
                e.currentTarget.style.borderColor = `${link.color}66`;
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${link.color}11`;
                e.currentTarget.style.borderColor = `${link.color}33`;
                e.currentTarget.style.transform = "translateY(0)";
              }}
              aria-label={link.label}
            >
              <div
                style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}
                aria-hidden="true"
              >
                {link.emoji}
              </div>
              <p
                style={{
                  color: link.color,
                  fontWeight: "bold",
                  fontSize: "15px",
                  margin: 0,
                }}
              >
                {link.label}
              </p>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div style={styles.card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <h2
              style={{
                color: "#fff",
                fontSize: "1.2rem",
                fontWeight: "700",
                margin: 0,
              }}
            >
              📦 Recent Orders
            </h2>
            <Link
              to="/admin/orders"
              style={{
                color: "#00d4aa",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: "600",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              View All →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem 1rem",
                background: "rgba(255,255,255,0.02)",
                borderRadius: "12px",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  margin: 0,
                }}
              >
                No orders yet. Orders will appear here once customers start
                purchasing.
              </p>
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
                marginLeft: "-1.5rem",
                marginRight: "-1.5rem",
                paddingLeft: "1.5rem",
                paddingRight: "1.5rem",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "700px",
                }}
                role="table"
                aria-label="Recent orders"
              >
                <thead>
                  <tr>
                    {[
                      { label: "Order ID", width: "15%" },
                      { label: "Customer", width: "20%" },
                      { label: "Items", width: "12%" },
                      { label: "Total", width: "15%" },
                      { label: "Status", width: "15%" },
                      { label: "Date", width: "15%" },
                      { label: "Actions", width: "8%" },
                    ].map((header) => (
                      <th
                        key={header.label}
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "12px",
                          fontWeight: "600",
                          textAlign: "left",
                          padding: "10px 12px",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          borderBottom: "1px solid rgba(255,255,255,0.08)",
                          width: header.width,
                        }}
                      >
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.02)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td
                        style={{
                          padding: "14px 12px",
                          color: "#00d4aa",
                          fontSize: "13px",
                          fontFamily: "monospace",
                          fontWeight: "600",
                        }}
                      >
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td
                        style={{
                          padding: "14px 12px",
                          color: "#fff",
                          fontSize: "13px",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "600" }}>
                            {order.user?.name || "N/A"}
                          </div>
                          {order.user?.email && (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "rgba(255,255,255,0.4)",
                                marginTop: "2px",
                              }}
                            >
                              {order.user.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "14px 12px",
                          color: "rgba(255,255,255,0.5)",
                          fontSize: "13px",
                        }}
                      >
                        {order.orderItems?.length || 0} item
                        {order.orderItems?.length !== 1 ? "s" : ""}
                      </td>
                      <td
                        style={{
                          padding: "14px 12px",
                          color: "#fff",
                          fontSize: "14px",
                          fontWeight: "bold",
                        }}
                      >
                        {formatCurrency(order.totalPrice)}
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        <span
                          style={{
                            background: `${statusColor(order.status)}22`,
                            color: statusColor(order.status),
                            padding: "4px 12px",
                            borderRadius: "50px",
                            fontSize: "11px",
                            fontWeight: "bold",
                            textTransform: "capitalize",
                            display: "inline-block",
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "14px 12px",
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "12px",
                        }}
                      >
                        {formatDate(order.createdAt)}
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        <Link
                          to={`/admin/orders/${order._id}`}
                          style={{
                            color: "#00d4aa",
                            textDecoration: "none",
                            fontSize: "18px",
                            transition: "transform 0.2s",
                            display: "inline-block",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.transform = "scale(1.2)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = "scale(1)")
                          }
                          aria-label={`View order ${order._id}`}
                        >
                          👁️
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Loading animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
