import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axios";

// ✅ Added isMobile
const isMobile = window.innerWidth <= 768;

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const sliderRef = useRef(null);
  const touchStart = useRef(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await axios.get("/blogs");
        setBlogs(data.blogs);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(blogs.length - 1, c + 1));

  const handleTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (diff > 50) next();
    else if (diff < -50) prev();
    touchStart.current = null;
  };

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
        <p style={{ color: "#00d4aa" }}>Loading blogs...</p>
      </div>
    );

  if (blogs.length === 0)
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
        <p style={{ fontSize: "4rem" }}>📝</p>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "1.2rem" }}>
          No blogs yet
        </p>
      </div>
    );

  const blog = blogs[current];

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", padding: "2rem" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
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
            Cricket Stories
          </p>
          <h1 style={{ color: "#fff", fontSize: "2.5rem", fontWeight: "900" }}>
            Our Blog
          </h1>
        </div>

        {/* Featured slider */}
        <div
          ref={sliderRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "24px",
            overflow: "hidden",
            marginBottom: "3rem",
            position: "relative",
          }}
        >
          {/* ✅ Updated cover height */}
          <div
            style={{
              height: isMobile ? "200px" : "320px",
              position: "relative",
              background: "rgba(255,255,255,0.06)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {blog.coverImage?.url ? (
              <img
                src={blog.coverImage.url}
                alt={blog.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: "6rem" }}>📝</span>
            )}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(15,15,26,0.9) 0%, transparent 60%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "1.5rem",
                left: "1.5rem",
                right: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "8px",
                  flexWrap: "wrap",
                }}
              >
                {blog.tags?.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: "rgba(0,212,170,0.2)",
                      color: "#00d4aa",
                      padding: "3px 10px",
                      borderRadius: "50px",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <h2
                style={{
                  color: "#fff",
                  fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
                  fontWeight: "800",
                  marginBottom: "8px",
                }}
              >
                {blog.title}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>
                By {blog.author} ·{" "}
                {new Date(blog.createdAt).toLocaleDateString("en-NP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                · 👁️ {blog.views} views
              </p>
            </div>
          </div>

          {/* Excerpt + Read more */}
          <div style={{ padding: "1.5rem" }}>
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "15px",
                lineHeight: 1.7,
                marginBottom: "1.5rem",
              }}
            >
              {blog.excerpt}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <Link
                to={`/blog/${blog.slug}`}
                style={{
                  background: "#00d4aa",
                  color: "#0f0f1a",
                  padding: "10px 28px",
                  borderRadius: "50px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                Read More →
              </Link>
              <div style={{ display: "flex", gap: "1rem" }}>
                <span
                  style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}
                >
                  ❤️ {blog.likes?.length || 0}
                </span>
                <span
                  style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}
                >
                  💬 {blog.comments?.length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* ✅ Updated nav arrows */}
          {blogs.length > 1 && (
            <>
              <button
                onClick={prev}
                disabled={current === 0}
                style={{
                  position: "absolute",
                  left: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(0,0,0,0.6)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  width: isMobile ? "36px" : "40px",
                  height: isMobile ? "36px" : "40px",
                  borderRadius: "50%",
                  cursor: current === 0 ? "not-allowed" : "pointer",
                  fontSize: "18px",
                  opacity: current === 0 ? 0.3 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ‹
              </button>
              <button
                onClick={next}
                disabled={current === blogs.length - 1}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(0,0,0,0.6)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  width: isMobile ? "36px" : "40px",
                  height: isMobile ? "36px" : "40px",
                  borderRadius: "50%",
                  cursor:
                    current === blogs.length - 1 ? "not-allowed" : "pointer",
                  fontSize: "18px",
                  opacity: current === blogs.length - 1 ? 0.3 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ›
              </button>
            </>
          )}

          {/* Dots */}
          {blogs.length > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "6px",
                padding: "0 0 1rem",
              }}
            >
              {blogs.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setCurrent(i)}
                  style={{
                    width: i === current ? "24px" : "8px",
                    height: "8px",
                    borderRadius: "50px",
                    cursor: "pointer",
                    background:
                      i === current ? "#00d4aa" : "rgba(255,255,255,0.2)",
                    transition: "all 0.3s",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* All blogs grid */}
        <h2
          style={{
            color: "#fff",
            fontSize: "1.5rem",
            fontWeight: "800",
            marginBottom: "1.5rem",
          }}
        >
          All Posts
        </h2>

        {/* ✅ Updated all blogs grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.2rem",
          }}
        >
          {blogs.map((b, i) => (
            <Link
              key={b._id}
              to={`/blog/${b.slug}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border:
                    i === current
                      ? "1px solid rgba(0,212,170,0.4)"
                      : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  transition: "all 0.3s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-4px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <div
                  style={{
                    height: "160px",
                    background: "rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {b.coverImage?.url ? (
                    <img
                      src={b.coverImage.url}
                      alt={b.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: "3rem" }}>📝</span>
                  )}
                </div>
                <div style={{ padding: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      marginBottom: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    {b.tags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        style={{
                          background: "rgba(0,212,170,0.1)",
                          color: "#00d4aa",
                          padding: "2px 8px",
                          borderRadius: "50px",
                          fontSize: "10px",
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h3
                    style={{
                      color: "#fff",
                      fontSize: "15px",
                      fontWeight: "700",
                      marginBottom: "6px",
                      lineHeight: 1.3,
                    }}
                  >
                    {b.title}
                  </h3>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    {new Date(b.createdAt).toLocaleDateString("en-NP", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: "13px",
                      lineHeight: 1.5,
                    }}
                  >
                    {b.excerpt?.slice(0, 80)}...
                  </p>
                  <div
                    style={{ display: "flex", gap: "1rem", marginTop: "10px" }}
                  >
                    <span
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        fontSize: "12px",
                      }}
                    >
                      ❤️ {b.likes?.length || 0}
                    </span>
                    <span
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        fontSize: "12px",
                      }}
                    >
                      💬 {b.comments?.length || 0}
                    </span>
                    <span
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        fontSize: "12px",
                      }}
                    >
                      👁️ {b.views}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
