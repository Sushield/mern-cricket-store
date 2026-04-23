/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "../../utils/axios";
import toast from "react-hot-toast";

const AdminCategoriesPage = () => {
  const { token } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    description: "",
    emoji: "🏏",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/categories");
      setCategories(data.categories);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageUpload = async () => {
    if (!imageFile) return null;
    try {
      setUploading(true);
      const formDataImg = new FormData();
      formDataImg.append("image", imageFile);
      const { data } = await axios.post("/upload", formDataImg, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return { url: data.url, public_id: data.public_id };
    } catch (error) {
      toast.error("Image upload failed!");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${token}` };
      let image = editCategory?.image || {};

      if (imageFile) {
        const uploaded = await handleImageUpload();
        if (uploaded) image = uploaded;
      }

      const categoryData = { ...formData, image };

      if (editCategory) {
        await axios.put(`/categories/${editCategory._id}`, categoryData, {
          headers,
        });
        toast.success("Category updated!");
      } else {
        await axios.post("/categories", categoryData, { headers });
        toast.success("Category created!");
      }

      setShowForm(false);
      setEditCategory(null);
      resetForm();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    }
  };

  const handleEdit = (category) => {
    setEditCategory(category);
    setFormData({
      name: category.name,
      label: category.label,
      description: category.description || "",
      emoji: category.emoji || "🏏",
      order: category.order || 0,
      isActive: category.isActive,
    });
    setImagePreview(category.image?.url || null);
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" category?`)) return;
    try {
      await axios.delete(`/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Category deleted!");
      fetchCategories();
    } catch (error) {
      toast.error("Delete failed!");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      label: "",
      description: "",
      emoji: "🏏",
      order: 0,
      isActive: true,
    });
    setImageFile(null);
    setImagePreview(null);
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

  const commonEmojis = [
    "🏏",
    "🔴",
    "🦺",
    "🧤",
    "⛑️",
    "👟",
    "👕",
    "🎒",
    "🏆",
    "⚡",
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", padding: "2rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <h1 style={{ color: "#fff", fontSize: "2rem", fontWeight: "800" }}>
            🏪 Manage Categories
          </h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditCategory(null);
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
            }}
          >
            {showForm ? "✕ Cancel" : "+ Add Category"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div
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
              {editCategory ? "✏️ Edit Category" : "➕ Add New Category"}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Image Upload */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Category Image</label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: "3rem" }}>{formData.emoji}</span>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      id="categoryImage"
                      style={{ display: "none" }}
                    />
                    <label
                      htmlFor="categoryImage"
                      style={{
                        display: "block",
                        background: "rgba(0,212,170,0.15)",
                        border: "1px solid rgba(0,212,170,0.4)",
                        color: "#00d4aa",
                        padding: "10px 20px",
                        borderRadius: "50px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "bold",
                        marginBottom: "8px",
                      }}
                    >
                      📷 Choose Image
                    </label>
                    {imageFile && (
                      <p
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "12px",
                          marginTop: "6px",
                        }}
                      >
                        {imageFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Category Name (slug)</label>
                  <input
                    style={inputStyle}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="bats"
                    required
                  />
                  <p
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: "11px",
                      marginTop: "4px",
                    }}
                  >
                    lowercase, no spaces (e.g. bats, cricket-balls)
                  </p>
                </div>
                <div>
                  <label style={labelStyle}>Display Label</label>
                  <input
                    style={inputStyle}
                    name="label"
                    value={formData.label}
                    onChange={handleChange}
                    placeholder="Cricket Bats"
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Description</label>
                <input
                  style={inputStyle}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="English Willow & Kashmir bats"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Display Order</label>
                  <input
                    style={inputStyle}
                    name="order"
                    type="number"
                    value={formData.order}
                    onChange={handleChange}
                    placeholder="1"
                  />
                  <p
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: "11px",
                      marginTop: "4px",
                    }}
                  >
                    Lower number shows first
                  </p>
                </div>
                <div>
                  <label style={labelStyle}>Emoji</label>
                  <input
                    style={inputStyle}
                    name="emoji"
                    value={formData.emoji}
                    onChange={handleChange}
                    placeholder="🏏"
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      marginTop: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    {commonEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, emoji })}
                        style={{
                          background:
                            formData.emoji === emoji
                              ? "rgba(0,212,170,0.2)"
                              : "rgba(255,255,255,0.06)",
                          border:
                            formData.emoji === emoji
                              ? "1px solid #00d4aa"
                              : "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          padding: "4px 8px",
                          cursor: "pointer",
                          fontSize: "18px",
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

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
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  id="isActive"
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <label
                  htmlFor="isActive"
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Show on Homepage & Products page
                </label>
              </div>

              <button
                type="submit"
                disabled={uploading}
                style={{
                  background: uploading ? "rgba(0,212,170,0.5)" : "#00d4aa",
                  color: "#0f0f1a",
                  border: "none",
                  padding: "12px 32px",
                  borderRadius: "50px",
                  cursor: uploading ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  fontSize: "15px",
                }}
              >
                {uploading
                  ? "⏳ Uploading..."
                  : editCategory
                    ? "✓ Update Category"
                    : "+ Create Category"}
              </button>
            </form>
          </div>
        )}

        {/* Categories Grid */}
        {loading ? (
          <p style={{ color: "#aaa" }}>Loading...</p>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "4rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🏪</div>
            <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "1rem" }}>
              No categories yet
            </p>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>
              Add your first category to get started!
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            {categories.map((category) => (
              <div
                key={category._id}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  overflow: "hidden",
                }}
              >
                {/* Image/Emoji */}
                <div
                  style={{
                    height: "120px",
                    background: "rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {category.image?.url ? (
                    <img
                      src={category.image.url}
                      alt={category.label}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: "3.5rem" }}>{category.emoji}</span>
                  )}
                  <span
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: category.isActive
                        ? "rgba(76,175,80,0.2)"
                        : "rgba(244,67,54,0.2)",
                      color: category.isActive ? "#4caf50" : "#f44336",
                      padding: "3px 10px",
                      borderRadius: "50px",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    {category.isActive ? "Active" : "Hidden"}
                  </span>
                </div>

                {/* Info */}
                <div style={{ padding: "1rem" }}>
                  <p
                    style={{
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "15px",
                      marginBottom: "4px",
                    }}
                  >
                    {category.label}
                  </p>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "12px",
                      marginBottom: "4px",
                    }}
                  >
                    /{category.name}
                  </p>
                  {category.description && (
                    <p
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        fontSize: "12px",
                        marginBottom: "8px",
                      }}
                    >
                      {category.description}
                    </p>
                  )}
                  <p
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: "11px",
                      marginBottom: "1rem",
                    }}
                  >
                    Order: {category.order}
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleEdit(category)}
                      style={{
                        background: "rgba(162,155,254,0.15)",
                        border: "1px solid rgba(162,155,254,0.3)",
                        color: "#a29bfe",
                        padding: "6px 14px",
                        borderRadius: "50px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "bold",
                        flex: 1,
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category._id, category.label)}
                      style={{
                        background: "rgba(255,107,107,0.15)",
                        border: "1px solid rgba(255,107,107,0.3)",
                        color: "#ff6b6b",
                        padding: "6px 14px",
                        borderRadius: "50px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "bold",
                        flex: 1,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
