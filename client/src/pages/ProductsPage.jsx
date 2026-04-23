import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "../utils/axios";

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

const ProductCard = ({ product }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? "rgba(255,255,255,0.08)"
          : "rgba(255,255,255,0.04)",
        border: hovered
          ? "1px solid rgba(0,212,170,0.4)"
          : "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "1.5rem",
        textAlign: "center",
        transition: "all 0.3s",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "0 8px 24px rgba(0,212,170,0.15)" : "none",
        position: "relative",
      }}
    >
      {product.promoLabel && (
        <span
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            background: "#ff6b6b",
            color: "#fff",
            padding: "2px 8px",
            borderRadius: "50px",
            fontSize: "10px",
            fontWeight: "bold",
          }}
        >
          {product.promoLabel}
        </span>
      )}

      {product.isOnSale && (
        <span
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "#ffd93d",
            color: "#0f0f1a",
            padding: "2px 8px",
            borderRadius: "50px",
            fontSize: "10px",
            fontWeight: "bold",
          }}
        >
          {product.discountPercent}% OFF
        </span>
      )}

      <div
        style={{
          width: "100px",
          height: "100px",
          margin: "0 auto 1rem",
          borderRadius: "12px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.06)",
        }}
      >
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: "3rem" }}>
            {getCategoryEmoji(product.category)}
          </span>
        )}
      </div>

      <h3
        style={{
          color: "#fff",
          fontSize: "14px",
          fontWeight: "700",
          marginBottom: "6px",
          lineHeight: 1.3,
        }}
      >
        {product.name}
      </h3>

      <p
        style={{
          color: "rgba(255,255,255,0.4)",
          fontSize: "12px",
          marginBottom: "6px",
          textTransform: "capitalize",
        }}
      >
        {product.brand} · {product.category}
      </p>

      {product.numReviews > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            marginBottom: "6px",
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
                fontSize: "13px",
              }}
            >
              ★
            </span>
          ))}
          <span
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "11px",
              marginLeft: "2px",
            }}
          >
            ({product.numReviews})
          </span>
        </div>
      )}

      <div style={{ marginBottom: "6px" }}>
        <span
          style={{ color: "#00d4aa", fontWeight: "bold", fontSize: "1.1rem" }}
        >
          Rs. {product.discountedPrice || product.price}
        </span>
        {product.isOnSale && (
          <span
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: "11px",
              textDecoration: "line-through",
              marginLeft: "6px",
            }}
          >
            Rs. {product.price}
          </span>
        )}
      </div>

      <p
        style={{
          color: product.stock > 0 ? "#4caf50" : "#f44336",
          fontSize: "11px",
          marginBottom: "1rem",
        }}
      >
        {product.stock > 0 ? "✓ In Stock" : "✗ Out of Stock"}
      </p>

      <Link
        to={`/products/${product._id}`}
        style={{
          background: hovered ? "#00d4aa" : "rgba(0,212,170,0.15)",
          color: hovered ? "#0f0f1a" : "#00d4aa",
          padding: "8px 20px",
          borderRadius: "50px",
          textDecoration: "none",
          fontSize: "12px",
          fontWeight: "bold",
          transition: "all 0.3s",
          display: "inline-block",
        }}
      >
        View Details
      </Link>
    </div>
  );
};

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sidebarCategories, setSidebarCategories] = useState([
    { name: "", label: "All Products", emoji: "🏪" },
  ]);
  // ✅ New state for mobile filter toggle
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("/categories");
        const active = data.categories.filter((c) => c.isActive);
        setSidebarCategories([
          { name: "", label: "All Products", emoji: "🏪" },
          ...active,
        ]);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (category) params.append("category", category);
        if (sort) params.append("sort", sort);
        const { data } = await axios.get(`/products?${params.toString()}`);

        const searchQuery = searchParams.get("search");
        if (searchQuery) {
          setSearch(searchQuery);
          const filtered = data.products.filter(
            (p) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.category.toLowerCase().includes(searchQuery.toLowerCase()),
          );
          setProducts(filtered);
          setAllProducts(data.products);
        } else {
          setProducts(data.products);
          setAllProducts(data.products);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, sort, searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) {
      setProducts(allProducts);
      return;
    }
    const filtered = allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()),
    );
    setProducts(filtered);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setSearch("");
    setSearchParams(cat ? { category: cat } : {});
  };

  const handlePriceFilter = () => {
    const filtered = allProducts.filter((p) => {
      const min = priceRange.min ? Number(priceRange.min) : 0;
      const max = priceRange.max ? Number(priceRange.max) : Infinity;
      return p.price >= min && p.price <= max;
    });
    setProducts(filtered);
  };

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setSort("");
    setPriceRange({ min: "", max: "" });
    setSearchParams({});
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "8px",
    color: "#fff",
    padding: "8px 12px",
    fontSize: "13px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        background: "#0f0f1a",
        minHeight: "100vh",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      {/* ✅ Mobile Filter Toggle Button + Quick Category Pills */}
      {isMobile && (
        <div
          style={{
            padding: "0.8rem 1rem",
            background: "#111122",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            gap: "8px",
            alignItems: "center",
            overflowX: "auto",
          }}
        >
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: showFilters ? "#00d4aa" : "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: showFilters ? "#0f0f1a" : "#fff",
              padding: "8px 16px",
              borderRadius: "50px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "bold",
              flexShrink: 0,
            }}
          >
            🔧 Filters {showFilters ? "▲" : "▼"}
          </button>

          {/* Quick category pills */}
          {sidebarCategories.slice(0, 5).map((cat) => (
            <button
              key={cat.name || "all"}
              onClick={() => handleCategoryChange(cat.name)}
              style={{
                background:
                  category === cat.name
                    ? "rgba(0,212,170,0.2)"
                    : "rgba(255,255,255,0.06)",
                border:
                  category === cat.name
                    ? "1px solid #00d4aa"
                    : "1px solid rgba(255,255,255,0.1)",
                color:
                  category === cat.name ? "#00d4aa" : "rgba(255,255,255,0.7)",
                padding: "8px 14px",
                borderRadius: "50px",
                cursor: "pointer",
                fontSize: "12px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* ✅ Collapsible Filter Panel (mobile only) */}
      {isMobile && showFilters && (
        <div
          style={{
            background: "#111122",
            padding: "1rem",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          {/* Search */}
          <div style={{ gridColumn: "1 / -1" }}>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Search
            </p>
            <form
              onSubmit={handleSearch}
              style={{ display: "flex", gap: "6px" }}
            >
              <input
                style={inputStyle}
                placeholder="Bat, ball, MRF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="submit"
                style={{
                  background: "#00d4aa",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  flexShrink: 0,
                }}
              >
                🔍
              </button>
            </form>
          </div>

          {/* All Categories */}
          <div style={{ gridColumn: "1 / -1" }}>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Category
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {sidebarCategories.map((cat) => (
                <button
                  key={cat.name || "all"}
                  onClick={() => {
                    handleCategoryChange(cat.name);
                    setShowFilters(false);
                  }}
                  style={{
                    background:
                      category === cat.name
                        ? "rgba(0,212,170,0.15)"
                        : "rgba(255,255,255,0.06)",
                    border:
                      category === cat.name
                        ? "1px solid rgba(0,212,170,0.4)"
                        : "1px solid rgba(255,255,255,0.1)",
                    color:
                      category === cat.name
                        ? "#00d4aa"
                        : "rgba(255,255,255,0.7)",
                    padding: "6px 12px",
                    borderRadius: "50px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Sort
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{ ...inputStyle, width: "100%" }}
            >
              <option value="">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Price Range
            </p>
            <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
              <input
                style={{ ...inputStyle, padding: "8px" }}
                placeholder="Min"
                type="number"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, min: e.target.value })
                }
              />
              <input
                style={{ ...inputStyle, padding: "8px" }}
                placeholder="Max"
                type="number"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, max: e.target.value })
                }
              />
            </div>
            <button
              onClick={() => {
                handlePriceFilter();
                setShowFilters(false);
              }}
              style={{
                width: "100%",
                background: "rgba(0,212,170,0.15)",
                border: "1px solid rgba(0,212,170,0.3)",
                color: "#00d4aa",
                borderRadius: "8px",
                padding: "8px",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Apply
            </button>
          </div>

          {/* Reset */}
          <button
            onClick={handleReset}
            style={{
              gridColumn: "1 / -1",
              background: "rgba(255,100,100,0.1)",
              border: "1px solid rgba(255,100,100,0.3)",
              color: "#ff6b6b",
              borderRadius: "8px",
              padding: "9px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ✅ Desktop Sidebar */}
      {!isMobile && (
        <div
          style={{
            width: "220px",
            background: "#111122",
            padding: "1.5rem 1rem",
            flexShrink: 0,
            borderRight: "1px solid rgba(255,255,255,0.08)",
            overflowY: "auto",
          }}
        >
          {/* Search */}
          <div style={{ marginBottom: "1.5rem" }}>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Search
            </p>
            <form
              onSubmit={handleSearch}
              style={{ display: "flex", gap: "6px" }}
            >
              <input
                style={inputStyle}
                placeholder="Bat, ball, MRF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="submit"
                style={{
                  background: "#00d4aa",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  flexShrink: 0,
                }}
              >
                🔍
              </button>
            </form>
          </div>

          {/* Categories */}
          <div style={{ marginBottom: "1.5rem" }}>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Category
            </p>
            {sidebarCategories.map((cat) => (
              <button
                key={cat.name || "all"}
                onClick={() => handleCategoryChange(cat.name)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "9px 12px",
                  marginBottom: "4px",
                  background:
                    category === cat.name
                      ? "rgba(0,212,170,0.15)"
                      : "transparent",
                  border:
                    category === cat.name
                      ? "1px solid rgba(0,212,170,0.4)"
                      : "1px solid transparent",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color:
                    category === cat.name ? "#00d4aa" : "rgba(255,255,255,0.6)",
                  fontSize: "13px",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: "14px" }}>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div style={{ marginBottom: "1.5rem" }}>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Sort By
            </p>
            {[
              { value: "", label: "Default" },
              { value: "price-asc", label: "Price: Low to High" },
              { value: "price-desc", label: "Price: High to Low" },
              { value: "newest", label: "Newest First" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSort(option.value)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "9px 12px",
                  marginBottom: "4px",
                  background:
                    sort === option.value
                      ? "rgba(0,212,170,0.15)"
                      : "transparent",
                  border:
                    sort === option.value
                      ? "1px solid rgba(0,212,170,0.4)"
                      : "1px solid transparent",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color:
                    sort === option.value ? "#00d4aa" : "rgba(255,255,255,0.6)",
                  fontSize: "13px",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: "1.5rem" }}>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Price Range
            </p>
            <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
              <input
                style={inputStyle}
                placeholder="Min"
                type="number"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, min: e.target.value })
                }
              />
              <input
                style={inputStyle}
                placeholder="Max"
                type="number"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, max: e.target.value })
                }
              />
            </div>
            <button
              onClick={handlePriceFilter}
              style={{
                width: "100%",
                background: "rgba(0,212,170,0.15)",
                border: "1px solid rgba(0,212,170,0.3)",
                color: "#00d4aa",
                borderRadius: "8px",
                padding: "8px",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Apply Filter
            </button>
          </div>

          {/* Reset */}
          <button
            onClick={handleReset}
            style={{
              width: "100%",
              background: "rgba(255,100,100,0.1)",
              border: "1px solid rgba(255,100,100,0.3)",
              color: "#ff6b6b",
              borderRadius: "8px",
              padding: "9px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Products Grid */}
      <div style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
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
          <h2 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "800" }}>
            {searchParams.get("search")
              ? `Results for "${searchParams.get("search")}"`
              : category
                ? category.charAt(0).toUpperCase() + category.slice(1)
                : "All Products"}
            <span
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.4)",
                fontWeight: "normal",
                marginLeft: "10px",
              }}
            >
              ({products.length} products)
            </span>
          </h2>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", marginTop: "4rem" }}>
            <p style={{ color: "#00d4aa", fontSize: "1.1rem" }}>
              Loading products...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "4rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔍</div>
            <h3 style={{ color: "#fff", marginBottom: "8px" }}>
              No products found
            </h3>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                marginBottom: "1.5rem",
              }}
            >
              Try adjusting your filters
            </p>
            <button
              onClick={handleReset}
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
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(2, 1fr)"
                : "repeat(auto-fill, minmax(200px, 1fr))",
              gap: isMobile ? "0.8rem" : "1.2rem",
            }}
          >
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
