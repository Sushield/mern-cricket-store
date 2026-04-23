import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
import toast from "react-hot-toast";

// ✅ Added isMobile
const isMobile = window.innerWidth <= 768;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Reset email sent!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send email!");
    } finally {
      setLoading(false);
    }
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
        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📧</div>
            <h2
              style={{
                color: "#fff",
                fontSize: "1.5rem",
                fontWeight: "800",
                marginBottom: "1rem",
              }}
            >
              Check Your Email!
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "14px",
                lineHeight: 1.7,
                marginBottom: "2rem",
              }}
            >
              We sent a password reset link to{" "}
              <strong style={{ color: "#00d4aa" }}>{email}</strong>. Check your
              inbox and click the link within 15 minutes.
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
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔐</div>
              <h2
                style={{
                  color: "#fff",
                  fontSize: "1.5rem",
                  fontWeight: "800",
                  marginBottom: "8px",
                }}
              >
                Forgot Password?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
                Enter your email and we'll send you a reset link
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "12px",
                    marginBottom: "6px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "15px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
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
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <p
                style={{
                  textAlign: "center",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "14px",
                }}
              >
                Remember it?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "#00d4aa",
                    fontWeight: "bold",
                    textDecoration: "none",
                  }}
                >
                  Login
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
