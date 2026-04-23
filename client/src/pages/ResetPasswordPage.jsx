import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../utils/axios";
import toast from "react-hot-toast";

// ✅ Added isMobile
const isMobile = window.innerWidth <= 768;

const ResetPasswordPage = () => {
  const { token } = useParams();
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }
    try {
      setLoading(true);
      await axios.put(`/auth/reset-password/${token}`, { password });
      setDone(true);
      toast.success("Password reset successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset failed!");
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
    fontSize: "15px",
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

  return (
    // ✅ Updated main wrapper
    <div
      style={{
        minHeight: "80vh",
        background: "#0f0f1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "1rem" : "2rem",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px",
          padding: isMobile ? "1.5rem" : "2.5rem",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
            <h2
              style={{
                color: "#fff",
                fontSize: "1.5rem",
                fontWeight: "800",
                marginBottom: "1rem",
              }}
            >
              Password Reset!
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "14px",
                marginBottom: "2rem",
              }}
            >
              Your password has been changed successfully.
            </p>
            <Link
              to="/login"
              style={{
                background: "#00d4aa",
                color: "#0f0f1a",
                padding: "12px 32px",
                borderRadius: "50px",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Login Now
            </Link>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔑</div>
              <h2
                style={{
                  color: "#fff",
                  fontSize: "1.5rem",
                  fontWeight: "800",
                  marginBottom: "8px",
                }}
              >
                Reset Password
              </h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
                Enter your new password below
              </p>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  required
                  style={inputStyle}
                />
              </div>

              {/* Password strength */}
              {password && (
                <div style={{ marginBottom: "1rem" }}>
                  <div
                    style={{ display: "flex", gap: "4px", marginBottom: "4px" }}
                  >
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: "4px",
                          borderRadius: "2px",
                          background:
                            password.length >= i * 3
                              ? i <= 1
                                ? "#f44336"
                                : i <= 2
                                  ? "#ffc107"
                                  : i <= 3
                                    ? "#00bcd4"
                                    : "#4caf50"
                              : "rgba(255,255,255,0.1)",
                          transition: "background 0.3s",
                        }}
                      />
                    ))}
                  </div>
                  <p
                    style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}
                  >
                    {password.length < 3
                      ? "Too weak"
                      : password.length < 6
                        ? "Weak"
                        : password.length < 9
                          ? "Good"
                          : "Strong"}
                  </p>
                </div>
              )}

              <button
                type="submit"
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
                  marginBottom: "1rem",
                }}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              <p
                style={{
                  textAlign: "center",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "14px",
                }}
              >
                <Link
                  to="/login"
                  style={{
                    color: "#00d4aa",
                    fontWeight: "bold",
                    textDecoration: "none",
                  }}
                >
                  Back to Login
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
