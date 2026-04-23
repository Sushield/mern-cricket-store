/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "../utils/axios";
import toast from "react-hot-toast";

// ✅ Added isMobile
const isMobile = window.innerWidth <= 768;

const getYouTubeId = (url) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : null;
};

const BlogDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    fetchBlog();
    window.scrollTo({ top: 0, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/blogs/${slug}`);
      setBlog(data.blog);
      setLikesCount(data.blog.likes?.length || 0);
      if (user) setLiked(data.blog.likes?.includes(user._id));

      const allBlogs = await axios.get("/blogs");
      setRelatedBlogs(
        allBlogs.data.blogs.filter((b) => b.slug !== slug).slice(0, 3),
      );
    } catch (error) {
      console.error(error);
      navigate("/blog");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error("Please login to like!");
      return;
    }
    try {
      const { data } = await axios.post(
        `/blogs/${slug}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setLiked(data.liked);
      setLikesCount(data.likes);
      toast.success(data.liked ? "❤️ Liked!" : "💔 Unliked!");
    } catch (error) {
      toast.error("Failed to like!");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to comment!");
      return;
    }
    if (!comment.trim()) return;
    try {
      setSubmitting(true);
      const { data } = await axios.post(
        `/blogs/${slug}/comment`,
        { text: comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setBlog({ ...blog, comments: data.comments });
      setComment("");
      toast.success("Comment added!");
    } catch (error) {
      toast.error("Failed to comment!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const { data } = await axios.delete(
        `/blogs/${slug}/comment/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setBlog({ ...blog, comments: data.comments });
      toast.success("Comment deleted!");
    } catch (error) {
      toast.error("Failed to delete!");
    }
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
        <p style={{ color: "#00d4aa" }}>Loading blog...</p>
      </div>
    );

  if (!blog) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a" }}>
      {/* ✅ Updated hero cover height */}
      <div
        style={{
          height: isMobile ? "220px" : "400px",
          position: "relative",
          background: "rgba(255,255,255,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {blog.coverImage?.url ? (
          <img
            src={blog.coverImage.url}
            alt={blog.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: "8rem" }}>📝</span>
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, #0f0f1a 0%, rgba(15,15,26,0.5) 60%, transparent 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: "800px",
            padding: "0 2rem",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "12px",
              flexWrap: "wrap",
            }}
          >
            {blog.tags?.map((tag) => (
              <span
                key={tag}
                style={{
                  background: "rgba(0,212,170,0.2)",
                  color: "#00d4aa",
                  padding: "3px 12px",
                  borderRadius: "50px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
          <h1
            style={{
              color: "#fff",
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              fontWeight: "900",
              lineHeight: 1.2,
              marginBottom: "12px",
            }}
          >
            {blog.title}
          </h1>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
              ✍️ {blog.author}
            </p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
              📅{" "}
              {new Date(blog.createdAt).toLocaleDateString("en-NP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
              👁️ {blog.views} views
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
        {/* Back */}
        <button
          onClick={() => navigate("/blog")}
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
          ← Back to Blog
        </button>

        {/* Content */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "2.5rem",
            marginBottom: "2rem",
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "16px",
              lineHeight: 1.9,
              whiteSpace: "pre-line",
            }}
          >
            {blog.content}
          </p>
        </div>

        {/* Media Section */}
        {blog.media?.length > 0 && (
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              padding: "2rem",
              marginBottom: "2rem",
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
              📸 Media
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {blog.media.map((m, i) => (
                <div key={i}>
                  {m.type === "youtube" && (
                    <div>
                      <iframe
                        width="100%"
                        height="400"
                        src={`https://www.youtube.com/embed/${getYouTubeId(m.url)}`}
                        title={m.caption || `Video ${i + 1}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ borderRadius: "12px" }}
                      />
                      {m.caption && (
                        <p
                          style={{
                            color: "rgba(255,255,255,0.4)",
                            fontSize: "13px",
                            marginTop: "8px",
                            textAlign: "center",
                          }}
                        >
                          {m.caption}
                        </p>
                      )}
                    </div>
                  )}
                  {m.type === "image" && (
                    <div>
                      <img
                        src={m.url}
                        alt={m.caption || `Image ${i + 1}`}
                        onClick={() => setActiveImage(m.url)}
                        style={{
                          width: "100%",
                          borderRadius: "12px",
                          cursor: "zoom-in",
                          objectFit: "cover",
                        }}
                      />
                      {m.caption && (
                        <p
                          style={{
                            color: "rgba(255,255,255,0.4)",
                            fontSize: "13px",
                            marginTop: "8px",
                            textAlign: "center",
                          }}
                        >
                          {m.caption}
                        </p>
                      )}
                    </div>
                  )}
                  {m.type === "video" && (
                    <div>
                      <video
                        controls
                        width="100%"
                        style={{ borderRadius: "12px" }}
                      >
                        <source src={m.url} />
                      </video>
                      {m.caption && (
                        <p
                          style={{
                            color: "rgba(255,255,255,0.4)",
                            fontSize: "13px",
                            marginTop: "8px",
                            textAlign: "center",
                          }}
                        >
                          {m.caption}
                        </p>
                      )}
                    </div>
                  )}
                  {m.type === "embed" && (
                    <div
                      dangerouslySetInnerHTML={{ __html: m.url }}
                      style={{ borderRadius: "12px", overflow: "hidden" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image lightbox */}
        {activeImage && (
          <div
            onClick={() => setActiveImage(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              background: "rgba(0,0,0,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "zoom-out",
              padding: "2rem",
            }}
          >
            <img
              src={activeImage}
              alt="full"
              style={{
                maxWidth: "100%",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: "12px",
              }}
            />
          </div>
        )}

        {/* ✅ Updated like/share buttons */}
        <div
          style={{
            display: "flex",
            gap: "0.8rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={handleLike}
            style={{
              background: liked
                ? "rgba(255,107,107,0.2)"
                : "rgba(255,255,255,0.06)",
              border: liked
                ? "1px solid rgba(255,107,107,0.5)"
                : "1px solid rgba(255,255,255,0.15)",
              color: liked ? "#ff6b6b" : "rgba(255,255,255,0.6)",
              padding: "10px 24px",
              borderRadius: "50px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "bold",
              transition: "all 0.3s",
            }}
          >
            {liked ? "❤️" : "🤍"} {likesCount}{" "}
            {likesCount === 1 ? "Like" : "Likes"}
          </button>
          <button
            onClick={handleShare}
            style={{
              background: "rgba(0,212,170,0.1)",
              border: "1px solid rgba(0,212,170,0.3)",
              color: "#00d4aa",
              padding: "10px 24px",
              borderRadius: "50px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "bold",
            }}
          >
            🔗 Share
          </button>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "rgba(66,103,178,0.2)",
                border: "1px solid rgba(66,103,178,0.4)",
                color: "#4267B2",
                padding: "10px 16px",
                borderRadius: "50px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              FB
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=${blog.title}`}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "rgba(29,161,242,0.2)",
                border: "1px solid rgba(29,161,242,0.4)",
                color: "#1DA1F2",
                padding: "10px 16px",
                borderRadius: "50px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              TW
            </a>
            <a
              href={`https://wa.me/?text=${blog.title} ${window.location.href}`}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "rgba(37,211,102,0.2)",
                border: "1px solid rgba(37,211,102,0.4)",
                color: "#25D366",
                padding: "10px 16px",
                borderRadius: "50px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              WA
            </a>
          </div>
        </div>

        {/* Comments */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "2rem",
            marginBottom: "2rem",
          }}
        >
          <h3
            style={{
              color: "#fff",
              fontSize: "1.2rem",
              fontWeight: "700",
              marginBottom: "1.5rem",
            }}
          >
            💬 Comments ({blog.comments?.length || 0})
          </h3>

          {/* Comment form */}
          {user ? (
            <form onSubmit={handleComment} style={{ marginBottom: "2rem" }}>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "rgba(0,212,170,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#00d4aa",
                    fontWeight: "bold",
                    fontSize: "16px",
                    flexShrink: 0,
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  {/* ✅ Updated comment textarea */}
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a comment..."
                    required
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: isMobile ? "16px" : "14px",
                      outline: "none",
                      resize: "vertical",
                      minHeight: isMobile ? "100px" : "80px",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      background: "#00d4aa",
                      color: "#0f0f1a",
                      border: "none",
                      padding: "10px 24px",
                      borderRadius: "50px",
                      cursor: submitting ? "not-allowed" : "pointer",
                      fontWeight: "bold",
                      fontSize: "14px",
                      marginTop: "8px",
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    {submitting ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div
              style={{
                background: "rgba(0,212,170,0.08)",
                border: "1px solid rgba(0,212,170,0.2)",
                borderRadius: "12px",
                padding: "1rem",
                marginBottom: "1.5rem",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "14px",
                  marginBottom: "10px",
                }}
              >
                Login to leave a comment
              </p>
              <Link
                to="/login"
                style={{
                  background: "#00d4aa",
                  color: "#0f0f1a",
                  padding: "8px 24px",
                  borderRadius: "50px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                Login
              </Link>
            </div>
          )}

          {/* Comments list */}
          {blog.comments?.length === 0 ? (
            <p
              style={{
                color: "rgba(255,255,255,0.3)",
                textAlign: "center",
                padding: "2rem",
              }}
            >
              No comments yet — be the first!
            </p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {blog.comments?.map((c) => (
                <div
                  key={c._id}
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "1rem",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "rgba(162,155,254,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#a29bfe",
                      fontWeight: "bold",
                      fontSize: "16px",
                      flexShrink: 0,
                    }}
                  >
                    {c.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "6px",
                      }}
                    >
                      <p
                        style={{
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: "14px",
                        }}
                      >
                        {c.name}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <p
                          style={{
                            color: "rgba(255,255,255,0.3)",
                            fontSize: "12px",
                          }}
                        >
                          {new Date(c.createdAt).toLocaleDateString("en-NP", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          ·{" "}
                          {new Date(c.createdAt).toLocaleTimeString("en-NP", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {(user?._id === c.user?.toString() ||
                          user?.role === "admin") && (
                          <button
                            onClick={() => handleDeleteComment(c._id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#ff6b6b",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "14px",
                        lineHeight: 1.6,
                      }}
                    >
                      {c.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Blogs */}
        {relatedBlogs.length > 0 && (
          <div>
            <h3
              style={{
                color: "#fff",
                fontSize: "1.3rem",
                fontWeight: "700",
                marginBottom: "1.5rem",
              }}
            >
              📖 Recommended Posts
            </h3>
            {/* ✅ Updated related blogs grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(2, 1fr)"
                  : "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "1rem",
              }}
            >
              {relatedBlogs.map((b) => (
                <Link
                  key={b._id}
                  to={`/blog/${b.slug}`}
                  style={{ textDecoration: "none" }}
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  <div
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "16px",
                      overflow: "hidden",
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor =
                        "rgba(0,212,170,0.4)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.08)")
                    }
                  >
                    <div
                      style={{
                        height: "130px",
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
                        <span style={{ fontSize: "2.5rem" }}>📝</span>
                      )}
                    </div>
                    <div style={{ padding: "1rem" }}>
                      <h4
                        style={{
                          color: "#fff",
                          fontSize: "13px",
                          fontWeight: "700",
                          marginBottom: "6px",
                          lineHeight: 1.3,
                        }}
                      >
                        {b.title}
                      </h4>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "11px",
                        }}
                      >
                        {new Date(b.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDetailPage;
