import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import axios from "../../utils/axios";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const wishlistCount = wishlistItems.length;

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setMenuOpen(false);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (!val.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        setSearching(true);
        const { data } = await axios.get("/products");
        const filtered = data.products.filter(
          (p) =>
            p.name.toLowerCase().includes(val.toLowerCase()) ||
            p.brand.toLowerCase().includes(val.toLowerCase()) ||
            p.category.toLowerCase().includes(val.toLowerCase()),
        );
        setResults(filtered.slice(0, 5));
        setShowResults(true);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (!search.trim()) return;
    setShowResults(false);
    setSearch("");
    setSearchOpen(false);
    setMenuOpen(false);
    navigate(`/products?search=${search}`);
  };

  const handleResultClick = (productId) => {
    setShowResults(false);
    setSearch("");
    setSearchOpen(false);
    navigate(`/products/${productId}`);
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

  const navLinks = [
    { to: "/", label: "Home", emoji: "🏠" },
    { to: "/products", label: "Products", emoji: "🏏" },
    { to: "/blog", label: "Blog", emoji: "📝" },
    { to: "/wishlist", label: "Wishlist", emoji: "❤️" },
    { to: "/cart", label: "Cart", emoji: "🛒" },
  ];

  const isMobile = window.innerWidth <= 768;

  return (
    <>
      <nav
        style={{
          background: "#1a1a2e",
          padding: "0.8rem 1.2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          boxShadow: "0 2px 20px rgba(0,0,0,0.5)",
          gap: "1rem",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            color: "#00d4aa",
            textDecoration: "none",
            fontSize: "1.2rem",
            fontWeight: "bold",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          🏏 CricketGear
        </Link>

        {/* Desktop Search */}
        {!isMobile && (
          <div
            ref={searchRef}
            style={{ position: "relative", flex: 1, maxWidth: "400px" }}
          >
            <form onSubmit={handleSearchSubmit}>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  onFocus={() => results.length > 0 && setShowResults(true)}
                  placeholder="Search products, brands..."
                  style={{
                    width: "100%",
                    padding: "9px 40px 9px 16px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "50px",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                    color: "#00d4aa",
                  }}
                >
                  {searching ? "⏳" : "🔍"}
                </button>
              </div>
            </form>

            {showResults && results.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  right: 0,
                  background: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  zIndex: 1001,
                }}
              >
                {results.map((product, i) => (
                  <div
                    key={product._id}
                    onClick={() => handleResultClick(product._id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      cursor: "pointer",
                      borderBottom:
                        i < results.length - 1
                          ? "1px solid rgba(255,255,255,0.05)"
                          : "none",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(0,212,170,0.1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        background: "rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
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
                        <span style={{ fontSize: "1.5rem" }}>
                          {getCategoryEmoji(product.category)}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          color: "#fff",
                          fontSize: "14px",
                          fontWeight: "600",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {product.name}
                      </p>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "12px",
                        }}
                      >
                        {product.brand} · {product.category}
                      </p>
                    </div>
                    <p
                      style={{
                        color: "#00d4aa",
                        fontWeight: "bold",
                        fontSize: "14px",
                        flexShrink: 0,
                      }}
                    >
                      Rs. {product.discountedPrice || product.price}
                    </p>
                  </div>
                ))}
                <div
                  onClick={handleSearchSubmit}
                  style={{
                    padding: "10px 16px",
                    textAlign: "center",
                    cursor: "pointer",
                    color: "#00d4aa",
                    fontSize: "13px",
                    fontWeight: "bold",
                    background: "rgba(0,212,170,0.05)",
                  }}
                >
                  View all results →
                </div>
              </div>
            )}
          </div>
        )}

        {/* Desktop Nav */}
        {!isMobile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              flexShrink: 0,
            }}
          >
            <Link
              to="/"
              style={{
                color: "#fff",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              Home
            </Link>
            <Link
              to="/products"
              style={{
                color: "#fff",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              Products
            </Link>
            <Link
              to="/blog"
              style={{
                color: "#fff",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              Blog
            </Link>

            <Link
              to="/wishlist"
              style={{
                color: "#fff",
                textDecoration: "none",
                position: "relative",
                fontSize: "20px",
              }}
            >
              ❤️
              {wishlistCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    background: "#ff6b6b",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    fontSize: "11px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              style={{
                color: "#fff",
                textDecoration: "none",
                position: "relative",
                fontSize: "20px",
              }}
            >
              🛒
              {items.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    background: "#00d4aa",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    fontSize: "11px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  {items.length}
                </span>
              )}
            </Link>

            {user ? (
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <Link
                  to="/profile"
                  style={{
                    color: "#00d4aa",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  Hi, {user.name.split(" ")[0]}
                </Link>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    style={{
                      color: "#ffd93d",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: "bold",
                      padding: "5px 12px",
                      border: "1px solid rgba(255,217,61,0.4)",
                      borderRadius: "6px",
                    }}
                  >
                    Admin ⚡
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "rgba(255,255,255,0.6)",
                    padding: "5px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <Link
                  to="/login"
                  style={{
                    color: "#fff",
                    textDecoration: "none",
                    padding: "6px 14px",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  style={{
                    background: "#00d4aa",
                    color: "#0f0f1a",
                    textDecoration: "none",
                    padding: "6px 14px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Mobile Icons */}
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              🔍
            </button>

            <Link
              to="/cart"
              style={{
                color: "#fff",
                textDecoration: "none",
                position: "relative",
                fontSize: "20px",
              }}
            >
              🛒
              {items.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    background: "#00d4aa",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    fontSize: "11px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  {items.length}
                </span>
              )}
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                padding: "4px",
              }}
            >
              <span
                style={{
                  display: "block",
                  width: "24px",
                  height: "2px",
                  background: "#fff",
                  borderRadius: "2px",
                  transition: "all 0.3s",
                  transform: menuOpen
                    ? "rotate(45deg) translateY(7px)"
                    : "none",
                }}
              />
              <span
                style={{
                  display: "block",
                  width: "24px",
                  height: "2px",
                  background: "#fff",
                  borderRadius: "2px",
                  opacity: menuOpen ? 0 : 1,
                  transition: "all 0.3s",
                }}
              />
              <span
                style={{
                  display: "block",
                  width: "24px",
                  height: "2px",
                  background: "#fff",
                  borderRadius: "2px",
                  transition: "all 0.3s",
                  transform: menuOpen
                    ? "rotate(-45deg) translateY(-7px)"
                    : "none",
                }}
              />
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Search */}
      {isMobile && searchOpen && (
        <div
          style={{
            background: "#1a1a2e",
            padding: "1rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            position: "sticky",
            top: "57px",
            zIndex: 999,
          }}
        >
          <div ref={searchRef} style={{ position: "relative" }}>
            <form onSubmit={handleSearchSubmit}>
              <input
                autoFocus
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search products..."
                style={{
                  width: "100%",
                  padding: "12px 44px 12px 16px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "50px",
                  color: "#fff",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="submit"
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: "#00d4aa",
                }}
              >
                🔍
              </button>
            </form>

            {showResults && results.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  right: 0,
                  background: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  zIndex: 1001,
                }}
              >
                {results.map((product, i) => (
                  <div
                    key={product._id}
                    onClick={() => handleResultClick(product._id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 16px",
                      cursor: "pointer",
                      borderBottom:
                        i < results.length - 1
                          ? "1px solid rgba(255,255,255,0.05)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        background: "rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
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
                        <span style={{ fontSize: "1.5rem" }}>
                          {getCategoryEmoji(product.category)}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          color: "#fff",
                          fontSize: "14px",
                          fontWeight: "600",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {product.name}
                      </p>
                      <p
                        style={{
                          color: "#00d4aa",
                          fontSize: "13px",
                          fontWeight: "bold",
                        }}
                      >
                        Rs. {product.discountedPrice || product.price}
                      </p>
                    </div>
                  </div>
                ))}
                <div
                  onClick={handleSearchSubmit}
                  style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    cursor: "pointer",
                    color: "#00d4aa",
                    fontSize: "14px",
                    fontWeight: "bold",
                    background: "rgba(0,212,170,0.05)",
                  }}
                >
                  View all results →
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobile && menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 998,
            backdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "280px",
            height: "100vh",
            background: "#1a1a2e",
            zIndex: 999,
            transform: menuOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s ease",
            overflowY: "auto",
            boxShadow: "-4px 0 20px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Drawer Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1.2rem 1.5rem",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: "#00d4aa",
                fontWeight: "bold",
                fontSize: "1.1rem",
              }}
            >
              🏏 CricketGear
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          {/* User Info */}
          {user && (
            <div
              style={{
                padding: "1rem 1.5rem",
                background: "rgba(0,212,170,0.08)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                flexShrink: 0,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "rgba(0,212,170,0.2)",
                    border: "2px solid #00d4aa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#00d4aa",
                    fontWeight: "bold",
                    fontSize: "20px",
                    flexShrink: 0,
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p
                    style={{
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "15px",
                    }}
                  >
                    {user.name}
                  </p>
                  <p
                    style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}
                  >
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Links */}
          <div style={{ flex: 1, padding: "1rem 0", overflowY: "auto" }}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 1.5rem",
                  textDecoration: "none",
                  color: location.pathname === link.to ? "#00d4aa" : "#fff",
                  background:
                    location.pathname === link.to
                      ? "rgba(0,212,170,0.1)"
                      : "transparent",
                  borderLeft:
                    location.pathname === link.to
                      ? "3px solid #00d4aa"
                      : "3px solid transparent",
                  fontSize: "15px",
                  fontWeight: location.pathname === link.to ? "bold" : "normal",
                }}
              >
                <span style={{ fontSize: "20px" }}>{link.emoji}</span>
                {link.label}
                {link.to === "/cart" && items.length > 0 && (
                  <span
                    style={{
                      marginLeft: "auto",
                      background: "#00d4aa",
                      color: "#0f0f1a",
                      borderRadius: "50px",
                      padding: "2px 8px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {items.length}
                  </span>
                )}
                {link.to === "/wishlist" && wishlistCount > 0 && (
                  <span
                    style={{
                      marginLeft: "auto",
                      background: "#ff6b6b",
                      color: "#fff",
                      borderRadius: "50px",
                      padding: "2px 8px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>
            ))}

            {user && (
              <>
                {[
                  { to: "/profile", emoji: "👤", label: "Profile" },
                  { to: "/orders", emoji: "📦", label: "My Orders" },
                  { to: "/kyc", emoji: "🪪", label: "KYC Verification" },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "14px 1.5rem",
                      textDecoration: "none",
                      color: "#fff",
                      fontSize: "15px",
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>{link.emoji}</span>
                    {link.label}
                  </Link>
                ))}
              </>
            )}

            {user?.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 1.5rem",
                  textDecoration: "none",
                  color: "#ffd93d",
                  fontSize: "15px",
                  fontWeight: "bold",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  marginTop: "8px",
                }}
              >
                <span style={{ fontSize: "20px" }}>⚡</span> Admin Dashboard
              </Link>
            )}
          </div>

          {/* Auth */}
          <div
            style={{
              padding: "1rem 1.5rem",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              flexShrink: 0,
            }}
          >
            {user ? (
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  background: "rgba(255,107,107,0.15)",
                  border: "1px solid rgba(255,107,107,0.3)",
                  color: "#ff6b6b",
                  padding: "12px",
                  borderRadius: "50px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "15px",
                }}
              >
                Logout
              </button>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "block",
                    textAlign: "center",
                    color: "#fff",
                    textDecoration: "none",
                    padding: "12px",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "50px",
                    fontSize: "15px",
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "block",
                    textAlign: "center",
                    background: "#00d4aa",
                    color: "#0f0f1a",
                    textDecoration: "none",
                    padding: "12px",
                    borderRadius: "50px",
                    fontSize: "15px",
                    fontWeight: "bold",
                  }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#1a1a2e",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            padding: "8px 0 12px",
            zIndex: 997,
            boxShadow: "0 -4px 20px rgba(0,0,0,0.4)",
          }}
        >
          {[
            { to: "/", emoji: "🏠", label: "Home" },
            { to: "/products", emoji: "🏏", label: "Shop" },
            {
              to: "/wishlist",
              emoji: "❤️",
              label: "Wishlist",
              count: wishlistCount,
            },
            { to: "/cart", emoji: "🛒", label: "Cart", count: items.length },
            {
              to: user ? "/profile" : "/login",
              emoji: user ? "👤" : "🔑",
              label: user ? "Profile" : "Login",
            },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                textDecoration: "none",
                position: "relative",
                flex: 1,
              }}
            >
              <span style={{ fontSize: "22px", lineHeight: 1 }}>
                {item.emoji}
              </span>
              {item.count > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "16px",
                    background: item.emoji === "🛒" ? "#00d4aa" : "#ff6b6b",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "16px",
                    height: "16px",
                    fontSize: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  {item.count}
                </span>
              )}
              <span
                style={{
                  color:
                    location.pathname === item.to
                      ? "#00d4aa"
                      : "rgba(255,255,255,0.4)",
                  fontSize: "10px",
                  fontWeight: location.pathname === item.to ? "bold" : "normal",
                }}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Bottom padding for mobile */}
      {isMobile && (
        <style>{`
          main { padding-bottom: 70px !important; }
        `}</style>
      )}
    </>
  );
};

export default Navbar;
