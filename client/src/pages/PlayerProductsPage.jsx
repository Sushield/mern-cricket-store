/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";

// ✅ Added isMobile
const isMobile = window.innerWidth <= 768;

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

const PlayerProductsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const { data } = await axios.get(`/players/${id}`);
        setPlayer(data.player);
      } catch (error) {
        console.error(error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [id]);

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

  if (!player) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", padding: "2rem" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            padding: "8px 20px",
            borderRadius: "50px",
            cursor: "pointer",
            marginBottom: "2rem",
            fontSize: "14px",
          }}
        >
          ← Back
        </button>

        {/* ✅ Updated Player Hero */}
        <div
          style={{
            background: `linear-gradient(135deg, ${player.color}22, rgba(255,255,255,0.04))`,
            border: `1px solid ${player.color}44`,
            borderRadius: "24px",
            padding: isMobile ? "1.2rem" : "2rem",
            display: "flex",
            gap: isMobile ? "1rem" : "2rem",
            alignItems: "center",
            marginBottom: "2rem",
            flexDirection: isMobile ? "column" : "row",
            textAlign: isMobile ? "center" : "left",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              overflow: "hidden",
              border: `3px solid ${player.color}`,
              flexShrink: 0,
              background: `${player.color}22`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {player.image?.url ? (
              <img
                src={player.image.url}
                alt={player.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: "3rem" }}>👤</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                color: player.color,
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              Pro Player Kit
            </p>
            <h1
              style={{
                color: "#fff",
                fontSize: "2rem",
                fontWeight: "900",
                marginBottom: "4px",
              }}
            >
              {player.name}
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              {player.country} · {player.role}
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "14px",
                lineHeight: 1.6,
              }}
            >
              {player.bio}
            </p>
          </div>
        </div>

        {/* Products */}
        <h2
          style={{
            color: "#fff",
            fontSize: "1.5rem",
            fontWeight: "800",
            marginBottom: "1.5rem",
          }}
        >
          {player.name}'s Gear
          <span
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: "14px",
              fontWeight: "normal",
              marginLeft: "10px",
            }}
          >
            ({player.products?.length || 0} products)
          </span>
        </h2>

        {player.products?.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏏</p>
            <p style={{ color: "rgba(255,255,255,0.4)" }}>
              No products associated yet
            </p>
          </div>
        ) : (
          // ✅ Updated products grid
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(2, 1fr)"
                : "repeat(auto-fill, minmax(220px, 1fr))",
              gap: isMobile ? "0.8rem" : "1.2rem",
            }}
          >
            {player.products.map((product) => (
              <div
                key={product._id}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  transition: "all 0.3s",
                }}
              >
                <div
                  style={{
                    height: "160px",
                    background: "rgba(255,255,255,0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: "3rem" }}>
                      {getCategoryEmoji(product.category)}
                    </span>
                  )}
                  {product.isOnSale && (
                    <span
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "#ffd93d",
                        color: "#0f0f1a",
                        padding: "2px 8px",
                        borderRadius: "50px",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    >
                      {product.discountPercent}% OFF
                    </span>
                  )}
                </div>
                <div style={{ padding: "1rem" }}>
                  <h3
                    style={{
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: "700",
                      marginBottom: "6px",
                    }}
                  >
                    {product.name}
                  </h3>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "12px",
                      marginBottom: "8px",
                      textTransform: "capitalize",
                    }}
                  >
                    {product.brand} · {product.category}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "1rem",
                    }}
                  >
                    <p
                      style={{
                        color: "#00d4aa",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                      }}
                    >
                      Rs. {product.discountedPrice || product.price}
                    </p>
                    {product.isOnSale && (
                      <p
                        style={{
                          color: "rgba(255,255,255,0.3)",
                          fontSize: "12px",
                          textDecoration: "line-through",
                        }}
                      >
                        Rs. {product.price}
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/products/${product._id}`}
                    style={{
                      display: "block",
                      textAlign: "center",
                      background: player.color,
                      color: "#0f0f1a",
                      padding: "8px",
                      borderRadius: "50px",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  >
                    View Details
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

export default PlayerProductsPage;
