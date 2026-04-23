import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "../utils/axios";
import toast from "react-hot-toast";
import { logout } from "../store/authSlice";

// ✅ Added isMobile
const isMobile = window.innerWidth <= 768;

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if (tab === "orders" && !ordersLoaded) {
      try {
        const { data } = await axios.get("/orders/myorders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(data.orders);
        setOrdersLoaded(true);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(
        "/users/profile",
        { name: formData.name },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Profile updated!");
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Update failed!");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }
    try {
      setLoading(true);
      await axios.put(
        "/users/password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Password changed!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed!");
    } finally {
      setLoading(false);
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

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    color: "rgba(255,255,255,0.5)",
    fontSize: "12px",
    marginBottom: "6px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "1px",
  };

  if (!user) {
    return (
      <div
        style={{
          minHeight: "80vh",
          background: "#0f0f1a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <p style={{ color: "#fff", fontSize: "1.2rem" }}>
          Please login to view your profile
        </p>
        <Link
          to="/login"
          style={{
            background: "#00d4aa",
            color: "#0f0f1a",
            padding: "10px 28px",
            borderRadius: "50px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", padding: "2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* ✅ Updated Profile Header */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(0,212,170,0.15), rgba(162,155,254,0.1))",
            border: "1px solid rgba(0,212,170,0.2)",
            borderRadius: "20px",
            padding: "1.5rem",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            gap: "1.5rem",
            marginBottom: "2rem",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(0,212,170,0.2)",
              border: "3px solid #00d4aa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#00d4aa",
            }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1
              style={{
                color: "#fff",
                fontSize: "1.8rem",
                fontWeight: "800",
                marginBottom: "4px",
              }}
            >
              {user.name}
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              {user.email}
            </p>
            <span
              style={{
                background:
                  user.role === "admin"
                    ? "rgba(255,217,61,0.15)"
                    : "rgba(0,212,170,0.15)",
                color: user.role === "admin" ? "#ffd93d" : "#00d4aa",
                padding: "3px 12px",
                borderRadius: "50px",
                fontSize: "12px",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {user.role === "admin" ? "⚡ Admin" : "👤 Member"}
            </span>
          </div>
          <button
            onClick={() => {
              dispatch(logout());
              navigate("/");
            }}
            style={{
              background: "rgba(255,107,107,0.15)",
              border: "1px solid rgba(255,107,107,0.3)",
              color: "#ff6b6b",
              padding: "8px 20px",
              borderRadius: "50px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "bold",
            }}
          >
            Logout
          </button>
        </div>

        {/* ✅ Updated Tabs */}
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
          {[
            { key: "profile", label: "👤 Profile" },
            { key: "orders", label: "📦 My Orders" },
            { key: "password", label: "🔒 Password" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
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
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              padding: "2rem",
            }}
          >
            <h2
              style={{
                color: "#fff",
                fontSize: "1.2rem",
                fontWeight: "700",
                marginBottom: "1.5rem",
              }}
            >
              Edit Profile
            </h2>
            <form onSubmit={handleProfileUpdate}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Full Name</label>
                <input
                  style={inputStyle}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Your name"
                />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Email</label>
                <input
                  style={{ ...inputStyle, opacity: 0.5 }}
                  value={formData.email}
                  disabled
                />
                <p
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "11px",
                    marginTop: "4px",
                  }}
                >
                  Email cannot be changed
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: "#00d4aa",
                  color: "#0f0f1a",
                  border: "none",
                  padding: "12px 32px",
                  borderRadius: "50px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  fontSize: "15px",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <h2
              style={{
                color: "#fff",
                fontSize: "1.2rem",
                fontWeight: "700",
                marginBottom: "1.5rem",
              }}
            >
              Order History
            </h2>
            {orders.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "4rem",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "16px",
                }}
              >
                <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: "1.5rem",
                  }}
                >
                  No orders yet
                </p>
                <Link
                  to="/products"
                  style={{
                    background: "#00d4aa",
                    color: "#0f0f1a",
                    padding: "10px 28px",
                    borderRadius: "50px",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  Shop Now 🏏
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
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
                      <div>
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
                            color: "rgba(255,255,255,0.3)",
                            fontSize: "12px",
                          }}
                        >
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-NP",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
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
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      <p
                        style={{
                          color: "rgba(255,255,255,0.5)",
                          fontSize: "13px",
                        }}
                      >
                        {order.orderItems.map((i) => i.name).join(", ")}
                      </p>
                      <p style={{ color: "#00d4aa", fontWeight: "bold" }}>
                        Rs. {order.totalPrice}
                      </p>
                    </div>
                    <div style={{ marginTop: "10px" }}>
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
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              padding: "2rem",
            }}
          >
            <h2
              style={{
                color: "#fff",
                fontSize: "1.2rem",
                fontWeight: "700",
                marginBottom: "1.5rem",
              }}
            >
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Current Password</label>
                <input
                  style={inputStyle}
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="••••••"
                  required
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>New Password</label>
                <input
                  style={inputStyle}
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Min 6 characters"
                  required
                />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Confirm New Password</label>
                <input
                  style={inputStyle}
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Repeat new password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: "#00d4aa",
                  color: "#0f0f1a",
                  border: "none",
                  padding: "12px 32px",
                  borderRadius: "50px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  fontSize: "15px",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
