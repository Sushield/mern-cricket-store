/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
import toast from "react-hot-toast";

// ✅ Added isMobile
const isMobile = window.innerWidth <= 768;

const KYCPage = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState({
    idFront: null,
    idBack: null,
    selfie: null,
  });
  const [files, setFiles] = useState({
    idFront: null,
    idBack: null,
    selfie: null,
  });
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    dateOfBirth: "",
    address: "",
    city: "",
    phone: "",
    idType: "citizenship",
    idNumber: "",
    idFront: {},
    idBack: {},
    selfie: {},
  });

  useEffect(() => {
    fetchKYC();
  }, []);

  const fetchKYC = async () => {
    try {
      const { data } = await axios.get("/kyc/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.kyc) {
        setKyc(data.kyc);
        setFormData({
          fullName: data.kyc.fullName,
          dateOfBirth: data.kyc.dateOfBirth,
          address: data.kyc.address,
          city: data.kyc.city,
          phone: data.kyc.phone,
          idType: data.kyc.idType,
          idNumber: data.kyc.idNumber,
          idFront: data.kyc.idFront || {},
          idBack: data.kyc.idBack || {},
          selfie: data.kyc.selfie || {},
        });
        setPreviews({
          idFront: data.kyc.idFront?.url || null,
          idBack: data.kyc.idBack?.url || null,
          selfie: data.kyc.selfie?.url || null,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setFiles({ ...files, [field]: file });
    setPreviews({ ...previews, [field]: URL.createObjectURL(file) });
  };

  const uploadFile = async (file) => {
    const formDataImg = new FormData();
    formDataImg.append("image", file);
    const { data } = await axios.post("/upload", formDataImg, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return { url: data.url, public_id: data.public_id };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setUploading(true);

      let idFront = formData.idFront;
      let idBack = formData.idBack;
      let selfie = formData.selfie;

      if (files.idFront) idFront = await uploadFile(files.idFront);
      if (files.idBack) idBack = await uploadFile(files.idBack);
      if (files.selfie) selfie = await uploadFile(files.selfie);

      setUploading(false);

      await axios.post(
        "/kyc",
        { ...formData, idFront, idBack, selfie },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("KYC submitted successfully!");
      fetchKYC();
    } catch (error) {
      toast.error(error.response?.data?.message || "Submission failed!");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
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

  const sectionStyle = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
  };

  if (!user)
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
        <p style={{ color: "#fff" }}>Please login to submit KYC</p>
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

  if (loading)
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
        <p style={{ color: "#00d4aa" }}>Loading...</p>
      </div>
    );

  const statusColor =
    kyc?.status === "verified"
      ? "#4caf50"
      : kyc?.status === "rejected"
        ? "#f44336"
        : "#ffc107";

  const statusEmoji =
    kyc?.status === "verified"
      ? "✅"
      : kyc?.status === "rejected"
        ? "❌"
        : "⏳";

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p
            style={{
              color: "#00d4aa",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Identity Verification
          </p>
          <h1
            style={{
              color: "#fff",
              fontSize: "2rem",
              fontWeight: "900",
              marginBottom: "8px",
            }}
          >
            KYC Verification
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
            Complete verification to unlock all features
          </p>
        </div>

        {/* Status Banner */}
        {kyc && (
          <div
            style={{
              background: `${statusColor}15`,
              border: `1px solid ${statusColor}44`,
              borderRadius: "16px",
              padding: "1.5rem",
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "3rem", marginBottom: "8px" }}>
              {statusEmoji}
            </p>
            <h2
              style={{
                color: statusColor,
                fontSize: "1.3rem",
                fontWeight: "800",
                marginBottom: "8px",
                textTransform: "capitalize",
              }}
            >
              KYC {kyc.status}
            </h2>
            {kyc.status === "verified" && (
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
                Verified on{" "}
                {new Date(kyc.verifiedAt).toLocaleDateString("en-NP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
            {kyc.status === "pending" && (
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
                Your documents are under review. We'll notify you via email.
              </p>
            )}
            {kyc.status === "rejected" && (
              <div>
                <p
                  style={{
                    color: "#f44336",
                    fontSize: "14px",
                    marginBottom: "8px",
                  }}
                >
                  <strong>Reason:</strong>{" "}
                  {kyc.rejectionReason || "Documents unclear or invalid"}
                </p>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
                  Please resubmit with correct documents below.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Form — show if no kyc or rejected */}
        {(!kyc || kyc.status === "rejected") && (
          <form onSubmit={handleSubmit}>
            {/* Personal Info */}
            <div style={sectionStyle}>
              <p
                style={{
                  color: "#00d4aa",
                  fontSize: "13px",
                  fontWeight: "700",
                  marginBottom: "1rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                👤 Personal Information
              </p>

              {/* ✅ Updated first grid */}
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
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="As on ID document"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Date of Birth</label>
                  <input
                    style={inputStyle}
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* ✅ Updated second grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input
                    style={inputStyle}
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="98XXXXXXXX"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>City</label>
                  <input
                    style={inputStyle}
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Kathmandu"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Full Address</label>
                <input
                  style={inputStyle}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street, Ward, Municipality"
                  required
                />
              </div>
            </div>

            {/* ID Document */}
            <div style={sectionStyle}>
              <p
                style={{
                  color: "#a29bfe",
                  fontSize: "13px",
                  fontWeight: "700",
                  marginBottom: "1rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                🪪 ID Document
              </p>

              {/* ✅ Updated ID document grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div>
                  <label style={labelStyle}>ID Type</label>
                  <select
                    style={inputStyle}
                    name="idType"
                    value={formData.idType}
                    onChange={handleChange}
                  >
                    <option value="citizenship">Citizenship</option>
                    <option value="passport">Passport</option>
                    <option value="driving_license">Driving License</option>
                    <option value="voter_id">Voter ID</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>ID Number</label>
                  <input
                    style={inputStyle}
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    placeholder="Document number"
                    required
                  />
                </div>
              </div>

              {/* Upload fields */}
              {[
                { field: "idFront", label: "ID Front Side", emoji: "🪪" },
                { field: "idBack", label: "ID Back Side", emoji: "🔄" },
                { field: "selfie", label: "Selfie with ID", emoji: "🤳" },
              ].map(({ field, label, emoji }) => (
                <div key={field} style={{ marginBottom: "1rem" }}>
                  <label style={labelStyle}>{label}</label>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        width: "120px",
                        height: "80px",
                        background: "rgba(255,255,255,0.06)",
                        borderRadius: "10px",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        border: previews[field]
                          ? "2px solid #00d4aa"
                          : "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {previews[field] ? (
                        <img
                          src={previews[field]}
                          alt={label}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: "2rem" }}>{emoji}</span>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, field)}
                        id={field}
                        style={{ display: "none" }}
                      />
                      <label
                        htmlFor={field}
                        style={{
                          display: "inline-block",
                          background: previews[field]
                            ? "rgba(76,175,80,0.15)"
                            : "rgba(162,155,254,0.15)",
                          border: `1px solid ${previews[field] ? "rgba(76,175,80,0.4)" : "rgba(162,155,254,0.4)"}`,
                          color: previews[field] ? "#4caf50" : "#a29bfe",
                          padding: "8px 18px",
                          borderRadius: "50px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: "bold",
                        }}
                      >
                        {previews[field] ? "✓ Uploaded" : "📷 Upload"}
                      </label>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.2)",
                          fontSize: "11px",
                          marginTop: "4px",
                        }}
                      >
                        JPG, PNG — Max 5MB
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Terms */}
            <div
              style={{
                background: "rgba(0,212,170,0.05)",
                border: "1px solid rgba(0,212,170,0.2)",
                borderRadius: "12px",
                padding: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <p
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "13px",
                  lineHeight: 1.6,
                }}
              >
                🔒 Your documents are encrypted and stored securely. We only use
                them for identity verification purposes and will never share
                them with third parties.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                background: submitting ? "rgba(0,212,170,0.5)" : "#00d4aa",
                color: "#0f0f1a",
                border: "none",
                padding: "14px",
                borderRadius: "50px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {uploading
                ? "⏳ Uploading Documents..."
                : submitting
                  ? "⏳ Submitting..."
                  : "✅ Submit KYC"}
            </button>
          </form>
        )}

        {/* Show submitted data if pending/verified */}
        {kyc && kyc.status !== "rejected" && (
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              padding: "2rem",
            }}
          >
            <h3
              style={{
                color: "#fff",
                fontSize: "1.1rem",
                fontWeight: "700",
                marginBottom: "1.5rem",
              }}
            >
              Submitted Information
            </h3>

            {/* ✅ Updated submitted info grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              {[
                { label: "Full Name", value: kyc.fullName },
                { label: "Date of Birth", value: kyc.dateOfBirth },
                { label: "Phone", value: kyc.phone },
                { label: "City", value: kyc.city },
                { label: "ID Type", value: kyc.idType?.replace("_", " ") },
                { label: "ID Number", value: kyc.idNumber },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "12px",
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: "600",
                      textTransform: "capitalize",
                    }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {[
                { label: "ID Front", img: kyc.idFront?.url },
                { label: "ID Back", img: kyc.idBack?.url },
                { label: "Selfie", img: kyc.selfie?.url },
              ].map(({ label, img }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "12px",
                      marginBottom: "6px",
                    }}
                  >
                    {label}
                  </p>
                  <div
                    style={{
                      width: "100px",
                      height: "70px",
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: "8px",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={label}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          color: "rgba(255,255,255,0.2)",
                          fontSize: "12px",
                        }}
                      >
                        No image
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYCPage;
