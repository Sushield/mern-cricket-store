/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "../../utils/axios";
import toast from "react-hot-toast";

const AdminCouponsPage = () => {
  const { token } = useSelector((state) => state.auth);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: 0,
    maxDiscount: "",
    usageLimit: "",
    isActive: true,
    expiresAt: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data } = await axios.get("/coupons", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(data.coupons);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        ...formData,
        code: formData.code.toUpperCase(),
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount),
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        expiresAt: formData.expiresAt || null,
      };
      if (editCoupon) {
        await axios.put(`/coupons/${editCoupon._id}`, payload, { headers });
        toast.success("Coupon updated!");
      } else {
        await axios.post("/coupons", payload, { headers });
        toast.success("Coupon created!");
      }
      setShowForm(false);
      setEditCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed!");
    }
  };

  const handleEdit = (coupon) => {
    setEditCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscount: coupon.maxDiscount || "",
      usageLimit: coupon.usageLimit || "",
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await axios.delete(`/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Coupon deleted!");
      fetchCoupons();
    } catch (error) {
      toast.error("Failed!");
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await axios.put(
        `/coupons/${coupon._id}`,
        { isActive: !coupon.isActive },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(
        coupon.isActive ? "Coupon deactivated!" : "Coupon activated!",
      );
      fetchCoupons();
    } catch (error) {
      toast.error("Failed!");
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minOrderAmount: 0,
      maxDiscount: "",
      usageLimit: "",
      isActive: true,
      expiresAt: "",
    });
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

  const isExpired = (expiresAt) =>
    expiresAt && new Date(expiresAt) < new Date();

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
          }}
        >
          <h1 style={{ color: "#fff", fontSize: "2rem", fontWeight: "800" }}>
            🎟️ Manage Coupons
          </h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditCoupon(null);
              resetForm();
            }}
            style={{
              background: "#00d4aa",
              color: "#0f0f1a",
              border: "none",
              padding: "10px 24px",
              borderRadius: "50px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            {showForm ? "✕ Cancel" : "+ New Coupon"}
          </button>
        </div>

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
            { label: "Total", value: coupons.length, color: "#a29bfe" },
            {
              label: "Active",
              value: coupons.filter(
                (c) => c.isActive && !isExpired(c.expiresAt),
              ).length,
              color: "#4caf50",
            },
            {
              label: "Expired",
              value: coupons.filter((c) => isExpired(c.expiresAt)).length,
              color: "#f44336",
            },
            {
              label: "Total Uses",
              value: coupons.reduce((acc, c) => acc + c.usedCount, 0),
              color: "#ffd93d",
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

        {/* Form */}
        {showForm && (
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "20px",
              padding: "2rem",
              marginBottom: "2rem",
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
              {editCoupon ? "✏️ Edit Coupon" : "➕ Create Coupon"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Coupon Code</label>
                  <input
                    style={{
                      ...inputStyle,
                      textTransform: "uppercase",
                      letterSpacing: "2px",
                      fontWeight: "bold",
                    }}
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="CRICKET20"
                    required
                  />
                  <p
                    style={{
                      color: "rgba(255,255,255,0.2)",
                      fontSize: "11px",
                      marginTop: "4px",
                    }}
                  >
                    Auto-converted to uppercase
                  </p>
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <input
                    style={inputStyle}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="20% off on all products"
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Discount Type</label>
                  <select
                    style={inputStyle}
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>
                    Discount Value (
                    {formData.discountType === "percentage" ? "%" : "Rs."})
                  </label>
                  <input
                    style={inputStyle}
                    name="discountValue"
                    type="number"
                    value={formData.discountValue}
                    onChange={handleChange}
                    placeholder={
                      formData.discountType === "percentage" ? "20" : "500"
                    }
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Min Order Amount (Rs.)</label>
                  <input
                    style={inputStyle}
                    name="minOrderAmount"
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                {formData.discountType === "percentage" && (
                  <div>
                    <label style={labelStyle}>Max Discount (Rs.)</label>
                    <input
                      style={inputStyle}
                      name="maxDiscount"
                      type="number"
                      value={formData.maxDiscount}
                      onChange={handleChange}
                      placeholder="Optional"
                    />
                  </div>
                )}
                <div>
                  <label style={labelStyle}>Usage Limit</label>
                  <input
                    style={inputStyle}
                    name="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={handleChange}
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Expires At</label>
                  <input
                    style={inputStyle}
                    name="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Preview */}
              {formData.discountValue && (
                <div
                  style={{
                    background: "rgba(0,212,170,0.08)",
                    border: "1px solid rgba(0,212,170,0.2)",
                    borderRadius: "10px",
                    padding: "1rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <p
                    style={{
                      color: "#00d4aa",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                  >
                    🎟️ Preview:{" "}
                    <span style={{ letterSpacing: "2px" }}>
                      {formData.code || "CODE"}
                    </span>
                    {" → "}
                    {formData.discountType === "percentage"
                      ? `${formData.discountValue}% off`
                      : `Rs. ${formData.discountValue} off`}
                    {formData.minOrderAmount > 0 &&
                      ` on orders above Rs. ${formData.minOrderAmount}`}
                    {formData.maxDiscount &&
                      ` (max Rs. ${formData.maxDiscount})`}
                  </p>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "1.5rem",
                }}
              >
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  id="isActive"
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <label
                  htmlFor="isActive"
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Active (users can use this coupon)
                </label>
              </div>

              <button
                type="submit"
                style={{
                  background: "#00d4aa",
                  color: "#0f0f1a",
                  border: "none",
                  padding: "12px 32px",
                  borderRadius: "50px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "15px",
                }}
              >
                {editCoupon ? "✓ Update Coupon" : "+ Create Coupon"}
              </button>
            </form>
          </div>
        )}

        {/* Coupons List */}
        {loading ? (
          <p style={{ color: "#aaa" }}>Loading...</p>
        ) : coupons.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "16px",
            }}
          >
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎟️</p>
            <p style={{ color: "rgba(255,255,255,0.4)" }}>No coupons yet</p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {coupons.map((coupon) => {
              const expired = isExpired(coupon.expiresAt);
              const statusColor = expired
                ? "#f44336"
                : coupon.isActive
                  ? "#4caf50"
                  : "#ffc107";
              const statusText = expired
                ? "Expired"
                : coupon.isActive
                  ? "Active"
                  : "Inactive";

              return (
                <div
                  key={coupon._id}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    borderLeft: `4px solid ${statusColor}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            color: "#ffd93d",
                            fontWeight: "900",
                            fontSize: "1.3rem",
                            letterSpacing: "3px",
                            fontFamily: "monospace",
                          }}
                        >
                          {coupon.code}
                        </span>
                        <span
                          style={{
                            background: `${statusColor}22`,
                            color: statusColor,
                            padding: "3px 12px",
                            borderRadius: "50px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            border: `1px solid ${statusColor}44`,
                          }}
                        >
                          {statusText}
                        </span>
                        <span
                          style={{
                            background: "rgba(162,155,254,0.15)",
                            color: "#a29bfe",
                            padding: "3px 12px",
                            borderRadius: "50px",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}% OFF`
                            : `Rs. ${coupon.discountValue} OFF`}
                        </span>
                      </div>

                      {coupon.description && (
                        <p
                          style={{
                            color: "rgba(255,255,255,0.6)",
                            fontSize: "14px",
                            marginBottom: "8px",
                          }}
                        >
                          {coupon.description}
                        </p>
                      )}

                      <div
                        style={{
                          display: "flex",
                          gap: "1.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        {coupon.minOrderAmount > 0 && (
                          <p
                            style={{
                              color: "rgba(255,255,255,0.4)",
                              fontSize: "13px",
                            }}
                          >
                            Min: Rs. {coupon.minOrderAmount}
                          </p>
                        )}
                        {coupon.maxDiscount && (
                          <p
                            style={{
                              color: "rgba(255,255,255,0.4)",
                              fontSize: "13px",
                            }}
                          >
                            Max: Rs. {coupon.maxDiscount}
                          </p>
                        )}
                        <p
                          style={{
                            color: "rgba(255,255,255,0.4)",
                            fontSize: "13px",
                          }}
                        >
                          Used: {coupon.usedCount}
                          {coupon.usageLimit ? `/${coupon.usageLimit}` : ""}
                        </p>
                        {coupon.expiresAt && (
                          <p
                            style={{
                              color: expired
                                ? "#f44336"
                                : "rgba(255,255,255,0.4)",
                              fontSize: "13px",
                            }}
                          >
                            Expires:{" "}
                            {new Date(coupon.expiresAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        onClick={() => toggleActive(coupon)}
                        style={{
                          background: coupon.isActive
                            ? "rgba(255,193,7,0.15)"
                            : "rgba(76,175,80,0.15)",
                          border: `1px solid ${coupon.isActive ? "rgba(255,193,7,0.3)" : "rgba(76,175,80,0.3)"}`,
                          color: coupon.isActive ? "#ffc107" : "#4caf50",
                          padding: "6px 16px",
                          borderRadius: "50px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {coupon.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleEdit(coupon)}
                        style={{
                          background: "rgba(162,155,254,0.15)",
                          border: "1px solid rgba(162,155,254,0.3)",
                          color: "#a29bfe",
                          padding: "6px 16px",
                          borderRadius: "50px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id, coupon.code)}
                        style={{
                          background: "rgba(255,107,107,0.15)",
                          border: "1px solid rgba(255,107,107,0.3)",
                          color: "#ff6b6b",
                          padding: "6px 16px",
                          borderRadius: "50px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCouponsPage;
