import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

const CategoryCard = ({ cat }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={`/products?category=${cat.name}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textDecoration: "none",
        display: "block",
        background: hovered ? "rgba(0,212,170,0.15)" : "rgba(255,255,255,0.06)",
        border: hovered
          ? "1px solid rgba(0,212,170,0.6)"
          : "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px",
        overflow: "hidden",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        transition: "all 0.3s ease",
        transform: hovered
          ? "translateY(-6px) scale(1.03)"
          : "translateY(0) scale(1)",
        boxShadow: hovered ? "0 12px 32px rgba(0,212,170,0.2)" : "none",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          height: "100px",
          background: "rgba(255,255,255,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {cat.image?.url ? (
          <img
            src={cat.image.url}
            alt={cat.label}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s",
              transform: hovered ? "scale(1.1)" : "scale(1)",
            }}
          />
        ) : (
          <span
            style={{
              fontSize: "2.5rem",
              transition: "transform 0.3s",
              transform: hovered ? "scale(1.2)" : "scale(1)",
              display: "block",
            }}
          >
            {cat.emoji || getCategoryEmoji(cat.name)}
          </span>
        )}
      </div>
      <div style={{ padding: "0.8rem", textAlign: "center" }}>
        <p
          style={{
            color: hovered ? "#00d4aa" : "#fff",
            fontWeight: "bold",
            fontSize: "13px",
            marginBottom: "3px",
            transition: "color 0.3s",
            textTransform: "capitalize",
          }}
        >
          {cat.label}
        </p>
        {cat.description && (
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "10px",
              lineHeight: 1.3,
            }}
          >
            {cat.description}
          </p>
        )}
      </div>
    </Link>
  );
};

const PlayerCard = ({ player }) => {
  const [hovered, setHovered] = useState(false);
  const color = player.color || "#00d4aa";
  return (
    <Link
      to={`/players/${player._id}`}
      style={{ textDecoration: "none", display: "block" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          background: hovered ? `${color}22` : "rgba(255,255,255,0.05)",
          border: `1px solid ${hovered ? color : "rgba(255,255,255,0.1)"}`,
          borderRadius: "16px",
          overflow: "hidden",
          backdropFilter: "blur(12px)",
          transition: "all 0.3s ease",
          transform: hovered ? "translateY(-6px)" : "translateY(0)",
          boxShadow: hovered ? `0 12px 32px ${color}44` : "none",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            height: "160px",
            background: `${color}11`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {player.image?.url ? (
            <img
              src={player.image.url}
              alt={player.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.3s",
                transform: hovered ? "scale(1.05)" : "scale(1)",
              }}
            />
          ) : (
            <span style={{ fontSize: "4rem" }}>👤</span>
          )}
        </div>
        <div style={{ padding: "1rem", textAlign: "center" }}>
          <p style={{ fontSize: "1rem", marginBottom: "2px" }}>
            {player.country}
          </p>
          <p
            style={{
              color: hovered ? color : "#fff",
              fontWeight: "bold",
              fontSize: "14px",
              marginBottom: "4px",
              transition: "color 0.3s",
            }}
          >
            {player.name}
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "12px",
              marginBottom: "6px",
            }}
          >
            {player.role}
          </p>
          {player.bio && (
            <p
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: "11px",
                lineHeight: 1.4,
              }}
            >
              {player.bio.length > 60
                ? player.bio.slice(0, 60) + "..."
                : player.bio}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

// ✅ Updated stickySection with isMobile padding
const stickySection = (bg, zIndex, first = false) => ({
  position: "sticky",
  top: 0,
  minHeight: "100vh",
  background: bg,
  borderRadius: first ? "0" : "40px 40px 0 0",
  boxShadow: first ? "none" : "0 -20px 60px rgba(0,0,0,0.8)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: isMobile ? "2rem 1rem" : "4rem 2rem",
  overflow: "hidden",
});

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [productsRes, categoriesRes, playersRes] = await Promise.all([
          axios.get("/products"),
          axios.get("/categories"),
          axios.get("/players"),
        ]);
        setFeaturedProducts(
          productsRes.data.products.filter((p) => p.isFeatured).slice(0, 4),
        );
        setCategories(categoriesRes.data.categories.filter((c) => c.isActive));
        setPlayers(playersRes.data.players.filter((p) => p.isFeatured));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
      `}</style>

      <div style={{ position: "relative" }}>
        {/* Section 1 — Hero */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={stickySection(
              "linear-gradient(135deg, #0f0f1a 0%, #1a1a3e 60%, #0f2027 100%)",
              1,
              true,
            )}
          >
            <div
              style={{
                position: "absolute",
                top: "10%",
                left: "5%",
                width: "350px",
                height: "350px",
                background:
                  "radial-gradient(circle, rgba(0,212,170,0.12) 0%, transparent 70%)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "10%",
                right: "5%",
                width: "280px",
                height: "280px",
                background:
                  "radial-gradient(circle, rgba(162,155,254,0.1) 0%, transparent 70%)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />
            <div
              style={{ textAlign: "center", position: "relative", zIndex: 1 }}
            >
              <p
                style={{
                  color: "#00d4aa",
                  fontSize: "12px",
                  fontWeight: "bold",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  marginBottom: "1rem",
                }}
              >
                Nepal's #1 Cricket Store
              </p>
              <h1
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 5rem)",
                  fontWeight: "900",
                  color: "#fff",
                  marginBottom: "1.5rem",
                  lineHeight: 1.1,
                }}
              >
                Play Like a <br />
                <span style={{ color: "#00d4aa" }}>Champion</span>
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: "1.1rem",
                  maxWidth: "500px",
                  margin: "0 auto 2.5rem",
                  lineHeight: 1.6,
                }}
              >
                Premium cricket gear trusted by professionals and aspiring
                players alike
              </p>

              {/* ✅ Updated hero buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  padding: isMobile ? "0 1rem" : "0",
                }}
              >
                <Link
                  to="/products"
                  style={{
                    background: "#00d4aa",
                    color: "#0f0f1a",
                    padding: "14px 36px",
                    borderRadius: "50px",
                    textDecoration: "none",
                    fontSize: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  Shop Now 🏏
                </Link>
                <Link
                  to="/products?category=bats"
                  style={{
                    background: "transparent",
                    color: "#fff",
                    padding: "14px 36px",
                    borderRadius: "50px",
                    textDecoration: "none",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
                  View Bats
                </Link>
              </div>

              <p
                style={{
                  color: "rgba(255,255,255,0.25)",
                  fontSize: "13px",
                  marginTop: "4rem",
                  animation: "bounce 2s infinite",
                }}
              >
                ↓ Scroll to explore
              </p>
            </div>
          </div>
        </div>

        {/* Section 2 — Featured Products */}
        <div style={{ position: "relative", zIndex: 2, marginTop: "-1px" }}>
          <div style={stickySection("#141428", 2)}>
            <div
              style={{
                textAlign: "center",
                marginBottom: "2rem",
                width: "100%",
              }}
            >
              <p
                style={{
                  color: "#00d4aa",
                  fontSize: "12px",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Hand Picked
              </p>
              <h2
                style={{
                  color: "#fff",
                  fontWeight: "800",
                  marginBottom: "8px",
                  fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                }}
              >
                Featured Products
              </h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
                Top picks from our collection
              </p>
            </div>
            {loading ? (
              <p style={{ color: "#00d4aa" }}>Loading...</p>
            ) : (
              // ✅ Updated featured products grid
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "repeat(2, 1fr)"
                    : "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: isMobile ? "0.8rem" : "1.5rem",
                  maxWidth: "900px",
                  width: "100%",
                }}
              >
                {featuredProducts.map((product) => (
                  <div
                    key={product._id}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                      overflow: "hidden",
                      backdropFilter: "blur(12px)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        height: "140px",
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
                          marginBottom: "6px",
                          fontSize: "14px",
                        }}
                      >
                        {product.name}
                      </h3>
                      {product.numReviews > 0 && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                            marginBottom: "4px",
                          }}
                        >
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              style={{
                                color:
                                  star <= Math.round(product.rating)
                                    ? "#ffd93d"
                                    : "rgba(255,255,255,0.2)",
                                fontSize: "12px",
                              }}
                            >
                              ★
                            </span>
                          ))}
                          <span
                            style={{
                              color: "rgba(255,255,255,0.4)",
                              fontSize: "11px",
                            }}
                          >
                            ({product.numReviews})
                          </span>
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "8px",
                          alignItems: "center",
                          marginBottom: "4px",
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
                      <p
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "12px",
                          marginBottom: "1rem",
                        }}
                      >
                        {product.brand}
                      </p>
                      <Link
                        to={`/products/${product._id}`}
                        style={{
                          background: "#00d4aa",
                          color: "#0f0f1a",
                          padding: "8px 20px",
                          borderRadius: "50px",
                          textDecoration: "none",
                          fontSize: "12px",
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
            <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
              <Link
                to="/products"
                style={{
                  background: "transparent",
                  color: "#00d4aa",
                  padding: "12px 32px",
                  borderRadius: "50px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  border: "1px solid #00d4aa",
                  fontSize: "15px",
                }}
              >
                View All Products →
              </Link>
            </div>
          </div>
        </div>

        {/* Section 3 — Players */}
        {players.length > 0 && (
          <div style={{ position: "relative", zIndex: 3, marginTop: "-1px" }}>
            <div style={stickySection("#0d0d1f", 3)}>
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "2rem",
                  width: "100%",
                }}
              >
                <p
                  style={{
                    color: "#ffd93d",
                    fontSize: "12px",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  Pro Player Kits
                </p>
                <h2
                  style={{
                    color: "#fff",
                    fontWeight: "800",
                    marginBottom: "8px",
                    fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                  }}
                >
                  Shop by Player
                </h2>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
                  Gear used by your favourite cricketers
                </p>
              </div>

              {/* ✅ Updated player grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "repeat(2, 1fr)"
                    : `repeat(${Math.min(players.length, 4)}, 1fr)`,
                  gap: isMobile ? "1rem" : "1.5rem",
                  maxWidth: "900px",
                  width: "100%",
                }}
              >
                {players.map((player) => (
                  <PlayerCard key={player._id} player={player} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 4 — Categories */}
        <div style={{ position: "relative", zIndex: 4, marginTop: "-1px" }}>
          <div style={stickySection("#141428", 4)}>
            <div
              style={{
                textAlign: "center",
                marginBottom: "2rem",
                width: "100%",
              }}
            >
              <p
                style={{
                  color: "#00d4aa",
                  fontSize: "12px",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Browse by Sport
              </p>
              <h2
                style={{
                  color: "#fff",
                  fontWeight: "800",
                  marginBottom: "8px",
                  fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                }}
              >
                Shop by Category
              </h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
                Find the perfect gear for your game
              </p>
            </div>
            {loading ? (
              <p style={{ color: "#00d4aa" }}>Loading...</p>
            ) : categories.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.3)" }}>
                No categories yet — add from Admin panel!
              </p>
            ) : (
              // ✅ Updated category grid
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "repeat(2, 1fr)"
                    : "repeat(4, 1fr)",
                  gap: isMobile ? "0.8rem" : "1rem",
                  maxWidth: "900px",
                  width: "100%",
                }}
              >
                {categories.map((cat) => (
                  <CategoryCard key={cat._id} cat={cat} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
