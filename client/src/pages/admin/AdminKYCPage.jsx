/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "../../utils/axios";
import toast from "react-hot-toast";

const AdminKYCPage = () => {
  const { token } = useSelector((state) => state.auth);
  const [kycs, setKycs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [rejectionReason, setRejectionReason] = useState({});
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchKYCs();
  }, []);

  const fetchKYCs = async () => {
    try {
      const { data } = await axios.get("/kyc", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKycs(data.kycs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await axios.put(
        `/kyc/${id}/status`,
        { status, rejectionReason: rejectionReason[id] || "" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(`KYC ${status}!`);
      fetchKYCs();
    } catch (error) {
      toast.error("Failed!");
    }
  };

  const statusColor = (status) => {
    const colors = {
      pending: "#ffc107",
      verified: "#4caf50",
      rejected: "#f44336",
    };
    return colors[status] || "#fff";
  };

  const filtered =
    filter === "all" ? kycs : kycs.filter((k) => k.status === filter);

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
          🪪 KYC Verifications
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
            { label: "Total", value: kycs.length, color: "#a29bfe" },
            {
              label: "Pending",
              value: kycs.filter((k) => k.status === "pending").length,
              color: "#ffc107",
            },
            {
              label: "Verified",
              value: kycs.filter((k) => k.status === "verified").length,
              color: "#4caf50",
            },
            {
              label: "Rejected",
              value: kycs.filter((k) => k.status === "rejected").length,
              color: "#f44336",
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
          {["all", "pending", "verified", "rejected"].map((f) => (
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

        {/* KYC List */}
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
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🪪</p>
            <p style={{ color: "rgba(255,255,255,0.4)" }}>
              No KYC submissions yet
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {filtered.map((kyc) => (
              <div
                key={kyc._id}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1.2rem 1.5rem",
                    flexWrap: "wrap",
                    gap: "10px",
                    cursor: "pointer",
                    background:
                      expanded === kyc._id
                        ? "rgba(255,255,255,0.03)"
                        : "transparent",
                  }}
                  onClick={() =>
                    setExpanded(expanded === kyc._id ? null : kyc._id)
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "rgba(0,212,170,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#00d4aa",
                        fontWeight: "bold",
                        fontSize: "18px",
                      }}
                    >
                      {kyc.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p
                        style={{
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: "15px",
                        }}
                      >
                        {kyc.user?.name}
                      </p>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "13px",
                        }}
                      >
                        {kyc.user?.email} · {kyc.idType?.replace("_", " ")} ·{" "}
                        {kyc.idNumber}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <span
                      style={{
                        background: `${statusColor(kyc.status)}22`,
                        color: statusColor(kyc.status),
                        padding: "4px 14px",
                        borderRadius: "50px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        border: `1px solid ${statusColor(kyc.status)}44`,
                      }}
                    >
                      {kyc.status}
                    </span>
                    <span
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        fontSize: "18px",
                      }}
                    >
                      {expanded === kyc._id ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* Expanded */}
                {expanded === kyc._id && (
                  <div
                    style={{
                      padding: "1.5rem",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {/* Personal Info */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(180px, 1fr))",
                        gap: "1rem",
                        marginBottom: "1.5rem",
                      }}
                    >
                      {[
                        { label: "Full Name", value: kyc.fullName },
                        { label: "Date of Birth", value: kyc.dateOfBirth },
                        { label: "Phone", value: kyc.phone },
                        { label: "City", value: kyc.city },
                        { label: "Address", value: kyc.address },
                        {
                          label: "Submitted",
                          value: new Date(kyc.createdAt).toLocaleDateString(),
                        },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p
                            style={{
                              color: "rgba(255,255,255,0.4)",
                              fontSize: "11px",
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
                            }}
                          >
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Documents */}
                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        flexWrap: "wrap",
                        marginBottom: "1.5rem",
                      }}
                    >
                      {[
                        { label: "ID Front", img: kyc.idFront?.url },
                        { label: "ID Back", img: kyc.idBack?.url },
                        { label: "Selfie", img: kyc.selfie?.url },
                      ].map(({ label, img }) => (
                        <div key={label}>
                          <p
                            style={{
                              color: "rgba(255,255,255,0.4)",
                              fontSize: "12px",
                              marginBottom: "6px",
                            }}
                          >
                            {label}
                          </p>
                          {img ? (
                            <a href={img} target="_blank" rel="noreferrer">
                              <img
                                src={img}
                                alt={label}
                                style={{
                                  width: "150px",
                                  height: "100px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  cursor: "zoom-in",
                                }}
                              />
                            </a>
                          ) : (
                            <div
                              style={{
                                width: "150px",
                                height: "100px",
                                background: "rgba(255,255,255,0.04)",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "rgba(255,255,255,0.2)",
                                fontSize: "12px",
                              }}
                            >
                              No image
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    {kyc.status === "pending" && (
                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          flexWrap: "wrap",
                          alignItems: "flex-end",
                        }}
                      >
                        <button
                          onClick={() => handleStatus(kyc._id, "verified")}
                          style={{
                            background: "rgba(76,175,80,0.15)",
                            border: "1px solid rgba(76,175,80,0.4)",
                            color: "#4caf50",
                            padding: "10px 24px",
                            borderRadius: "50px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "bold",
                          }}
                        >
                          ✅ Verify
                        </button>
                        <div style={{ flex: 1, minWidth: "200px" }}>
                          <input
                            style={{
                              width: "100%",
                              padding: "10px 14px",
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,107,107,0.3)",
                              borderRadius: "8px",
                              color: "#fff",
                              fontSize: "14px",
                              outline: "none",
                              boxSizing: "border-box",
                              marginBottom: "8px",
                            }}
                            placeholder="Rejection reason..."
                            value={rejectionReason[kyc._id] || ""}
                            onChange={(e) =>
                              setRejectionReason({
                                ...rejectionReason,
                                [kyc._id]: e.target.value,
                              })
                            }
                          />
                          <button
                            onClick={() => handleStatus(kyc._id, "rejected")}
                            style={{
                              background: "rgba(255,107,107,0.15)",
                              border: "1px solid rgba(255,107,107,0.4)",
                              color: "#ff6b6b",
                              padding: "10px 24px",
                              borderRadius: "50px",
                              cursor: "pointer",
                              fontSize: "14px",
                              fontWeight: "bold",
                            }}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {kyc.status === "verified" && (
                      <p style={{ color: "#4caf50", fontSize: "14px" }}>
                        ✅ Verified on{" "}
                        {new Date(kyc.verifiedAt).toLocaleDateString()}
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
                          ❌ Rejected — {kyc.rejectionReason}
                        </p>
                        <button
                          onClick={() => handleStatus(kyc._id, "verified")}
                          style={{
                            background: "rgba(76,175,80,0.15)",
                            border: "1px solid rgba(76,175,80,0.4)",
                            color: "#4caf50",
                            padding: "8px 20px",
                            borderRadius: "50px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "bold",
                          }}
                        >
                          ✅ Approve Now
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminKYCPage;
