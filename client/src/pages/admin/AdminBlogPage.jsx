/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import axios from "../../utils/axios";
import toast from "react-hot-toast";

const AdminBlogPage = () => {
  const { token } = useSelector((state) => state.auth);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editBlog, setEditBlog] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    tags: "",
    author: "Admin",
    isPublished: false,
    media: [],
    mediaUrl: "",
    mediaType: "youtube",
    mediaCaption: "",
  });

  // Cleanup object URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (coverPreview && coverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  useEffect(() => {
    fetchBlogs();
  }, [token]);

  const fetchBlogs = async () => {
    try {
      const { data } = await axios.get("/blogs/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(data.blogs);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback((e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  }, []);

  const handleCoverChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Revoke previous object URL to prevent memory leak
      if (coverPreview && coverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }

      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    },
    [coverPreview],
  );

  const uploadCover = async () => {
    if (!coverFile) return null;
    try {
      setUploading(true);
      const formDataImg = new FormData();
      formDataImg.append("image", coverFile);
      const { data } = await axios.post("/upload", formDataImg, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return { url: data.url, public_id: data.public_id };
    } catch (error) {
      toast.error(error.response?.data?.message || "Cover upload failed!");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const validateMediaUrl = (url, type) => {
    if (!url.trim()) return false;

    switch (type) {
      case "youtube":
        return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url);
      case "image":
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
      case "video":
        return /^https?:\/\/.+\.(mp4|webm|ogg)$/i.test(url);
      case "embed":
        return url.includes("<iframe") || url.includes("<embed");
      default:
        return true;
    }
  };

  const addMedia = useCallback(() => {
    const { mediaUrl, mediaType, mediaCaption } = formData;

    if (!mediaUrl.trim()) {
      toast.error("Please enter a media URL");
      return;
    }

    if (!validateMediaUrl(mediaUrl, mediaType)) {
      toast.error(`Invalid ${mediaType} URL format`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      media: [
        ...prev.media,
        {
          type: mediaType,
          url: mediaUrl.trim(),
          caption: mediaCaption.trim(),
        },
      ],
      mediaUrl: "",
      mediaCaption: "",
    }));

    toast.success("Media added successfully");
  }, [formData]);

  const removeMedia = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
    toast.success("Media removed");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Content is required");
      return;
    }

    try {
      setSubmitting(true);
      const headers = { Authorization: `Bearer ${token}` };
      let coverImage = editBlog?.coverImage || {};

      if (coverFile) {
        const uploaded = await uploadCover();
        if (!uploaded) {
          throw new Error("Cover upload failed");
        }
        coverImage = uploaded;
      }

      const blogData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        author: formData.author,
        isPublished: formData.isPublished,
        media: formData.media,
        coverImage,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editBlog) {
        await axios.put(`/blogs/${editBlog._id}`, blogData, { headers });
        toast.success("Blog updated successfully!");
      } else {
        await axios.post("/blogs", blogData, { headers });
        toast.success("Blog created successfully!");
      }

      setShowForm(false);
      setEditBlog(null);
      resetForm();
      fetchBlogs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = useCallback((blog) => {
    setEditBlog(blog);
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      tags: blog.tags?.join(", ") || "",
      author: blog.author || "Admin",
      isPublished: blog.isPublished,
      media: blog.media || [],
      mediaUrl: "",
      mediaType: "youtube",
      mediaCaption: "",
    });
    setCoverPreview(blog.coverImage?.url || null);
    setCoverFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await axios.delete(`/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Blog deleted successfully!");
      fetchBlogs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed!");
    }
  };

  const togglePublish = async (blog) => {
    try {
      await axios.put(
        `/blogs/${blog._id}`,
        { isPublished: !blog.isPublished },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(
        blog.isPublished
          ? "Blog unpublished successfully!"
          : "Blog published successfully!",
      );
      fetchBlogs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed!");
    }
  };

  const resetForm = useCallback(() => {
    // Revoke object URL before resetting
    if (coverPreview && coverPreview.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview);
    }

    setFormData({
      title: "",
      excerpt: "",
      content: "",
      tags: "",
      author: "Admin",
      isPublished: false,
      media: [],
      mediaUrl: "",
      mediaType: "youtube",
      mediaCaption: "",
    });
    setCoverFile(null);
    setCoverPreview(null);
  }, [coverPreview]);

  // Memoized styles to prevent recreation on every render
  const styles = useMemo(
    () => ({
      container: {
        minHeight: "100vh",
        background: "#0f0f1a",
        padding: "2rem",
      },
      inputStyle: {
        width: "100%",
        padding: "10px 14px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "8px",
        color: "#fff",
        fontSize: "14px",
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.2s",
      },
      labelStyle: {
        display: "block",
        color: "rgba(255,255,255,0.5)",
        fontSize: "12px",
        marginBottom: "6px",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "1px",
      },
      sectionStyle: {
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        padding: "1.5rem",
        marginBottom: "1.5rem",
      },
    }),
    [],
  );

  const isFormDisabled = uploading || submitting;

  return (
    <div style={styles.container}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <h1
            style={{
              color: "#fff",
              fontSize: "2rem",
              fontWeight: "800",
              margin: 0,
            }}
          >
            📝 Manage Blogs
          </h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditBlog(null);
              resetForm();
            }}
            style={{
              background: "#00d4aa",
              color: "#0f0f1a",
              border: "none",
              padding: "10px 24px",
              borderRadius: "50px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            aria-label={showForm ? "Cancel creating blog" : "Create new blog"}
          >
            {showForm ? "✕ Cancel" : "+ New Blog"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "20px",
              padding: "2rem",
              marginBottom: "2rem",
            }}
          >
            <h2
              style={{
                color: "#fff",
                fontSize: "1.2rem",
                fontWeight: "700",
                marginBottom: "1.5rem",
              }}
            >
              {editBlog ? "✏️ Edit Blog" : "➕ Write New Blog"}
            </h2>

            {/* Cover Image */}
            <div style={styles.sectionStyle}>
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
                🖼️ Cover Image
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: "200px",
                    height: "120px",
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: "12px",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                  role="img"
                  aria-label={
                    coverPreview ? "Cover image preview" : "No cover image"
                  }
                >
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: "2rem",
                        color: "rgba(255,255,255,0.2)",
                      }}
                    >
                      📸
                    </span>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    id="coverImg"
                    style={{ display: "none" }}
                    disabled={isFormDisabled}
                    aria-label="Upload cover image"
                  />
                  <label
                    htmlFor="coverImg"
                    style={{
                      display: "inline-block",
                      background: isFormDisabled
                        ? "rgba(0,212,170,0.08)"
                        : "rgba(0,212,170,0.15)",
                      border: "1px solid rgba(0,212,170,0.4)",
                      color: isFormDisabled ? "rgba(0,212,170,0.5)" : "#00d4aa",
                      padding: "10px 20px",
                      borderRadius: "50px",
                      cursor: isFormDisabled ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      fontWeight: "bold",
                      transition: "all 0.2s",
                    }}
                  >
                    📷 Choose Cover
                  </label>
                  {coverFile && (
                    <p
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "12px",
                        marginTop: "6px",
                      }}
                    >
                      {coverFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div style={styles.sectionStyle}>
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
                📋 Blog Info
              </p>
              <div style={{ marginBottom: "1rem" }}>
                <label style={styles.labelStyle} htmlFor="title">
                  Title *
                </label>
                <input
                  id="title"
                  style={styles.inputStyle}
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Blog post title..."
                  required
                  disabled={isFormDisabled}
                  aria-required="true"
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={styles.labelStyle} htmlFor="excerpt">
                  Excerpt (short summary) *
                </label>
                <textarea
                  id="excerpt"
                  style={{
                    ...styles.inputStyle,
                    minHeight: "70px",
                    resize: "vertical",
                  }}
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  placeholder="Brief summary shown on blog list..."
                  required
                  disabled={isFormDisabled}
                  aria-required="true"
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                }}
              >
                <div>
                  <label style={styles.labelStyle} htmlFor="author">
                    Author
                  </label>
                  <input
                    id="author"
                    style={styles.inputStyle}
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    placeholder="Author name"
                    disabled={isFormDisabled}
                  />
                </div>
                <div>
                  <label style={styles.labelStyle} htmlFor="tags">
                    Tags (comma separated)
                  </label>
                  <input
                    id="tags"
                    style={styles.inputStyle}
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="cricket, tips, gear"
                    disabled={isFormDisabled}
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={styles.sectionStyle}>
              <p
                style={{
                  color: "#ffd93d",
                  fontSize: "13px",
                  fontWeight: "700",
                  marginBottom: "1rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                ✍️ Blog Content
              </p>
              <label style={styles.labelStyle} htmlFor="content">
                Content *
              </label>
              <textarea
                id="content"
                style={{
                  ...styles.inputStyle,
                  minHeight: "300px",
                  resize: "vertical",
                  lineHeight: 1.8,
                }}
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your full blog content here..."
                required
                disabled={isFormDisabled}
                aria-required="true"
              />
              <p
                style={{
                  color: "rgba(255,255,255,0.2)",
                  fontSize: "11px",
                  marginTop: "6px",
                }}
              >
                Use blank lines to separate paragraphs
              </p>
            </div>

            {/* Media */}
            <div style={styles.sectionStyle}>
              <p
                style={{
                  color: "#ff6b6b",
                  fontSize: "13px",
                  fontWeight: "700",
                  marginBottom: "1rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                🎬 Embed Media
              </p>

              {/* Existing media */}
              {formData.media.length > 0 && (
                <div style={{ marginBottom: "1rem" }} role="list">
                  {formData.media.map((m, i) => (
                    <div
                      key={i}
                      role="listitem"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px",
                        borderRadius: "8px",
                        marginBottom: "6px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <span style={{ fontSize: "18px" }} aria-hidden="true">
                        {m.type === "youtube"
                          ? "▶️"
                          : m.type === "image"
                            ? "🖼️"
                            : m.type === "video"
                              ? "🎥"
                              : "🔗"}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: "600",
                            margin: 0,
                          }}
                        >
                          {m.type.toUpperCase()}
                        </p>
                        <p
                          style={{
                            color: "rgba(255,255,255,0.4)",
                            fontSize: "11px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            margin: 0,
                          }}
                        >
                          {m.url}
                        </p>
                        {m.caption && (
                          <p
                            style={{
                              color: "rgba(255,255,255,0.3)",
                              fontSize: "11px",
                              margin: 0,
                            }}
                          >
                            {m.caption}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedia(i)}
                        disabled={isFormDisabled}
                        style={{
                          background: "rgba(255,107,107,0.2)",
                          border: "1px solid rgba(255,107,107,0.3)",
                          color: "#ff6b6b",
                          borderRadius: "50px",
                          padding: "4px 10px",
                          cursor: isFormDisabled ? "not-allowed" : "pointer",
                          fontSize: "12px",
                          opacity: isFormDisabled ? 0.5 : 1,
                        }}
                        aria-label={`Remove ${m.type} media`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <select
                  style={styles.inputStyle}
                  name="mediaType"
                  value={formData.mediaType}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                  aria-label="Media type"
                >
                  <option value="youtube">YouTube</option>
                  <option value="image">Image URL</option>
                  <option value="video">Video URL</option>
                  <option value="embed">Embed Code</option>
                </select>
                <input
                  style={styles.inputStyle}
                  name="mediaUrl"
                  placeholder="Paste URL or embed code..."
                  value={formData.mediaUrl}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                  aria-label="Media URL"
                />
              </div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input
                  style={{ ...styles.inputStyle, flex: 1 }}
                  name="mediaCaption"
                  placeholder="Caption (optional)"
                  value={formData.mediaCaption}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                  aria-label="Media caption"
                />
                <button
                  type="button"
                  onClick={addMedia}
                  disabled={isFormDisabled}
                  style={{
                    background: "rgba(255,107,107,0.15)",
                    border: "1px solid rgba(255,107,107,0.3)",
                    color: "#ff6b6b",
                    borderRadius: "50px",
                    padding: "10px 20px",
                    cursor: isFormDisabled ? "not-allowed" : "pointer",
                    fontSize: "13px",
                    fontWeight: "bold",
                    flexShrink: 0,
                    opacity: isFormDisabled ? 0.5 : 1,
                  }}
                  aria-label="Add media"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Publish */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "1.5rem",
              }}
            >
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                id="isPublished"
                disabled={isFormDisabled}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <label
                htmlFor="isPublished"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                🌐 Publish immediately
              </label>
            </div>

            <button
              type="submit"
              disabled={isFormDisabled}
              style={{
                background: isFormDisabled ? "rgba(0,212,170,0.5)" : "#00d4aa",
                color: "#0f0f1a",
                border: "none",
                padding: "14px 40px",
                borderRadius: "50px",
                cursor: isFormDisabled ? "not-allowed" : "pointer",
                fontWeight: "bold",
                fontSize: "16px",
                transition: "all 0.2s",
              }}
            >
              {uploading
                ? "⏳ Uploading..."
                : submitting
                  ? "💾 Saving..."
                  : editBlog
                    ? "✓ Update Blog"
                    : "+ Publish Blog"}
            </button>
          </form>
        )}

        {/* Blogs List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "3px solid rgba(0,212,170,0.3)",
                borderTop: "3px solid #00d4aa",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            />
            <p style={{ color: "#aaa", marginTop: "1rem" }}>Loading blogs...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "16px",
            }}
          >
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</p>
            <p style={{ color: "rgba(255,255,255,0.4)" }}>
              No blogs yet. Create your first blog!
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            role="list"
          >
            {blogs.map((blog) => (
              <article
                key={blog._id}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  display: "flex",
                  gap: "0",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0,212,170,0.3)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Cover */}
                <div
                  style={{
                    width: "140px",
                    flexShrink: 0,
                    background: "rgba(255,255,255,0.06)",
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
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <span style={{ fontSize: "2.5rem" }} aria-hidden="true">
                      📝
                    </span>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, padding: "1.2rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: "250px" }}>
                      <h3
                        style={{
                          color: "#fff",
                          fontSize: "16px",
                          fontWeight: "700",
                          marginBottom: "4px",
                          margin: 0,
                        }}
                      >
                        {blog.title}
                      </h3>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "13px",
                          marginBottom: "8px",
                          margin: "4px 0 8px",
                        }}
                      >
                        By {blog.author} ·{" "}
                        {new Date(blog.createdAt).toLocaleDateString("en-NP", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.5)",
                          fontSize: "13px",
                          lineHeight: 1.5,
                          margin: 0,
                        }}
                      >
                        {blog.excerpt?.slice(0, 100)}
                        {blog.excerpt?.length > 100 && "..."}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginTop: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        {blog.tags?.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              background: "rgba(0,212,170,0.1)",
                              color: "#00d4aa",
                              padding: "2px 8px",
                              borderRadius: "50px",
                              fontSize: "11px",
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        alignItems: "flex-end",
                      }}
                    >
                      <span
                        style={{
                          background: blog.isPublished
                            ? "rgba(76,175,80,0.15)"
                            : "rgba(255,193,7,0.15)",
                          color: blog.isPublished ? "#4caf50" : "#ffc107",
                          padding: "4px 12px",
                          borderRadius: "50px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {blog.isPublished ? "🌐 Published" : "📋 Draft"}
                      </span>
                      <span
                        style={{
                          color: "rgba(255,255,255,0.3)",
                          fontSize: "12px",
                        }}
                      >
                        👁️ {blog.views} · ❤️ {blog.likes?.length || 0} · 💬{" "}
                        {blog.comments?.length || 0}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "1rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() => handleEdit(blog)}
                      style={{
                        background: "rgba(162,155,254,0.15)",
                        border: "1px solid rgba(162,155,254,0.3)",
                        color: "#a29bfe",
                        padding: "6px 16px",
                        borderRadius: "50px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "bold",
                        transition: "all 0.2s",
                      }}
                      aria-label={`Edit ${blog.title}`}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => togglePublish(blog)}
                      style={{
                        background: blog.isPublished
                          ? "rgba(255,193,7,0.15)"
                          : "rgba(76,175,80,0.15)",
                        border: `1px solid ${blog.isPublished ? "rgba(255,193,7,0.3)" : "rgba(76,175,80,0.3)"}`,
                        color: blog.isPublished ? "#ffc107" : "#4caf50",
                        padding: "6px 16px",
                        borderRadius: "50px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "bold",
                        transition: "all 0.2s",
                      }}
                      aria-label={
                        blog.isPublished
                          ? `Unpublish ${blog.title}`
                          : `Publish ${blog.title}`
                      }
                    >
                      {blog.isPublished ? "📋 Unpublish" : "🌐 Publish"}
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id, blog.title)}
                      style={{
                        background: "rgba(255,107,107,0.15)",
                        border: "1px solid rgba(255,107,107,0.3)",
                        color: "#ff6b6b",
                        padding: "6px 16px",
                        borderRadius: "50px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "bold",
                        transition: "all 0.2s",
                      }}
                      aria-label={`Delete ${blog.title}`}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Add loading animation CSS */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminBlogPage;
