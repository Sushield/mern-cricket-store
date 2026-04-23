/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "../../utils/axios";
import toast from "react-hot-toast";

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

const AdminProductsPage = () => {
  const { token } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    details: "",
    price: "",
    discountPercent: 0,
    promoLabel: "",
    category: "",
    brand: "",
    stock: "",
    isFeatured: false,
    images: [],
    videos: [],
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/products");
      setProducts(data.products);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/categories");
      setCategories(data.categories);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const uploadImages = async () => {
    const uploaded = [];
    for (const file of imageFiles) {
      const formDataImg = new FormData();
      formDataImg.append("image", file);
      const { data } = await axios.post("/upload", formDataImg, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      uploaded.push({ url: data.url, public_id: data.public_id });
    }
    return uploaded;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      const headers = { Authorization: `Bearer ${token}` };
      let images = formData.images;
      let videos = formData.videos;

      if (imageFiles.length > 0) {
        const uploaded = await uploadImages();
        images = editProduct ? [...images, ...uploaded] : uploaded;
      }

      if (videoUrl.trim()) {
        videos = [...videos, { url: videoUrl.trim(), public_id: "" }];
      }

      const productData = {
        ...formData,
        images,
        videos,
        price: Number(formData.price),
        stock: Number(formData.stock),
        discountPercent: Number(formData.discountPercent),
      };

      if (editProduct) {
        await axios.put(`/products/${editProduct._id}`, productData, {
          headers,
        });
        toast.success("Product updated!");
      } else {
        await axios.post("/products", productData, { headers });
        toast.success("Product created!");
      }

      setShowForm(false);
      setEditProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      details: product.details || "",
      price: product.price,
      discountPercent: product.discountPercent || 0,
      promoLabel: product.promoLabel || "",
      category: product.category,
      brand: product.brand,
      stock: product.stock,
      isFeatured: product.isFeatured,
      images: product.images || [],
      videos: product.videos || [],
    });
    setImagePreviews(product.images?.map((i) => i.url) || []);
    setImageFiles([]);
    setVideoUrl("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await axios.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Product deleted!");
      fetchProducts();
    } catch (error) {
      toast.error("Delete failed!");
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setImagePreviews(newImages.map((i) => i.url));
    setImageFiles([]);
  };

  const removeVideo = (index) => {
    const newVideos = formData.videos.filter((_, i) => i !== index);
    setFormData({ ...formData, videos: newVideos });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      details: "",
      price: "",
      discountPercent: 0,
      promoLabel: "",
      category: "",
      brand: "",
      stock: "",
      isFeatured: false,
      images: [],
      videos: [],
    });
    setImageFiles([]);
    setImagePreviews([]);
    setVideoUrl("");
  };

  const discountedPrice =
    formData.price && formData.discountPercent > 0
      ? Math.round(
          formData.price - (formData.price * formData.discountPercent) / 100,
        )
      : formData.price;

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
            🏏 Manage Products
          </h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditProduct(null);
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
            {showForm ? "✕ Cancel" : "+ Add Product"}
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
              {editProduct ? "✏️ Edit Product" : "➕ Add New Product"}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Basic Info */}
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
                  📋 Basic Information
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Product Name</label>
                    <input
                      style={inputStyle}
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="MRF Virat Kohli Bat"
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Brand</label>
                    <input
                      style={inputStyle}
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="MRF, SG, SS..."
                      required
                    />
                  </div>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={labelStyle}>Short Description</label>
                  <textarea
                    style={{
                      ...inputStyle,
                      minHeight: "80px",
                      resize: "vertical",
                    }}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief product description..."
                    required
                  />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={labelStyle}>Full Details</label>
                  <textarea
                    style={{
                      ...inputStyle,
                      minHeight: "120px",
                      resize: "vertical",
                    }}
                    name="details"
                    value={formData.details}
                    onChange={handleChange}
                    placeholder="Full product details, specifications, features..."
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Price (Rs.)</label>
                    <input
                      style={inputStyle}
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="15000"
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Stock</label>
                    <input
                      style={inputStyle}
                      name="stock"
                      type="number"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="10"
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select
                      style={inputStyle}
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Discount & Promo */}
              <div style={sectionStyle}>
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
                  🏷️ Discount & Promo
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Discount %</label>
                    <input
                      style={inputStyle}
                      name="discountPercent"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountPercent}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Promo Label</label>
                    <input
                      style={inputStyle}
                      name="promoLabel"
                      value={formData.promoLabel}
                      onChange={handleChange}
                      placeholder="SALE, HOT, NEW..."
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Final Price</label>
                    <div
                      style={{
                        ...inputStyle,
                        background: "rgba(0,212,170,0.08)",
                        border: "1px solid rgba(0,212,170,0.3)",
                        color: "#00d4aa",
                        fontWeight: "bold",
                      }}
                    >
                      Rs. {discountedPrice || 0}
                    </div>
                  </div>
                </div>
                {formData.discountPercent > 0 && (
                  <div
                    style={{
                      background: "rgba(255,217,61,0.08)",
                      border: "1px solid rgba(255,217,61,0.2)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                    }}
                  >
                    <p style={{ color: "#ffd93d", fontSize: "13px" }}>
                      💰 Customer saves{" "}
                      <strong>Rs. {formData.price - discountedPrice}</strong> (
                      {formData.discountPercent}% off)
                    </p>
                  </div>
                )}
              </div>

              {/* Images */}
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
                  📸 Product Images
                </p>

                {/* Existing images */}
                {formData.images.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                      marginBottom: "1rem",
                    }}
                  >
                    {formData.images.map((img, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img
                          src={img.url}
                          alt={`product-${i}`}
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          style={{
                            position: "absolute",
                            top: "-8px",
                            right: "-8px",
                            background: "#ff6b6b",
                            border: "none",
                            borderRadius: "50%",
                            width: "22px",
                            height: "22px",
                            cursor: "pointer",
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New previews */}
                {imagePreviews.length > 0 && formData.images.length === 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                      marginBottom: "1rem",
                    }}
                  >
                    {imagePreviews.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`preview-${i}`}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "2px solid #a29bfe",
                        }}
                      />
                    ))}
                  </div>
                )}

                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    id="multiImage"
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="multiImage"
                    style={{
                      display: "inline-block",
                      background: "rgba(162,155,254,0.15)",
                      border: "1px solid rgba(162,155,254,0.4)",
                      color: "#a29bfe",
                      padding: "10px 20px",
                      borderRadius: "50px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    📷 Choose Images (Multiple)
                  </label>
                  {imageFiles.length > 0 && (
                    <p
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "12px",
                      }}
                    >
                      {imageFiles.length} file(s) selected
                    </p>
                  )}
                </div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.2)",
                    fontSize: "11px",
                    marginTop: "8px",
                  }}
                >
                  You can select multiple images at once
                </p>
              </div>

              {/* Videos */}
              <div style={sectionStyle}>
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
                  🎥 Product Videos
                </p>

                {/* Existing videos */}
                {formData.videos.length > 0 && (
                  <div style={{ marginBottom: "1rem" }}>
                    {formData.videos.map((video, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "8px",
                          background: "rgba(255,255,255,0.04)",
                          borderRadius: "8px",
                          padding: "10px",
                        }}
                      >
                        <span style={{ fontSize: "20px" }}>🎥</span>
                        <p
                          style={{
                            color: "#fff",
                            fontSize: "12px",
                            flex: 1,
                            wordBreak: "break-all",
                          }}
                        >
                          {video.url}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeVideo(i)}
                          style={{
                            background: "rgba(255,107,107,0.2)",
                            border: "1px solid rgba(255,107,107,0.4)",
                            color: "#ff6b6b",
                            borderRadius: "50px",
                            padding: "4px 10px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="Paste YouTube or video URL..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!videoUrl.trim()) return;
                      setFormData({
                        ...formData,
                        videos: [
                          ...formData.videos,
                          { url: videoUrl.trim(), public_id: "" },
                        ],
                      });
                      setVideoUrl("");
                    }}
                    style={{
                      background: "rgba(255,107,107,0.15)",
                      border: "1px solid rgba(255,107,107,0.3)",
                      color: "#ff6b6b",
                      borderRadius: "50px",
                      padding: "10px 20px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "bold",
                      flexShrink: 0,
                    }}
                  >
                    + Add Video
                  </button>
                </div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.2)",
                    fontSize: "11px",
                    marginTop: "8px",
                  }}
                >
                  Paste YouTube links or direct video URLs
                </p>
              </div>

              {/* Settings */}
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
                  ⚙️ Settings
                </p>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    id="isFeatured"
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <label
                    htmlFor="isFeatured"
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    ⭐ Show on Homepage (Featured)
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                style={{
                  background: uploading ? "rgba(0,212,170,0.5)" : "#00d4aa",
                  color: "#0f0f1a",
                  border: "none",
                  padding: "14px 40px",
                  borderRadius: "50px",
                  cursor: uploading ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                {uploading
                  ? "⏳ Saving..."
                  : editProduct
                    ? "✓ Update Product"
                    : "+ Create Product"}
              </button>
            </form>
          </div>
        )}

        {/* Products Table */}
        {loading ? (
          <p style={{ color: "#aaa" }}>Loading...</p>
        ) : (
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                  {[
                    "Product",
                    "Category",
                    "Price",
                    "Discount",
                    "Stock",
                    "Featured",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "11px",
                        fontWeight: "700",
                        textAlign: "left",
                        padding: "14px 16px",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product._id}
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            background: "rgba(255,255,255,0.06)",
                            borderRadius: "8px",
                            overflow: "hidden",
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
                        <div>
                          <p
                            style={{
                              color: "#fff",
                              fontSize: "14px",
                              fontWeight: "600",
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
                            {product.brand}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          background: "rgba(0,212,170,0.1)",
                          color: "#00d4aa",
                          padding: "3px 10px",
                          borderRadius: "50px",
                          fontSize: "12px",
                          textTransform: "capitalize",
                        }}
                      >
                        {product.category}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <p
                        style={{
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: "14px",
                        }}
                      >
                        Rs. {product.discountedPrice || product.price}
                      </p>
                      {product.isOnSale && (
                        <p
                          style={{
                            color: "rgba(255,255,255,0.3)",
                            fontSize: "11px",
                            textDecoration: "line-through",
                          }}
                        >
                          Rs. {product.price}
                        </p>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {product.discountPercent > 0 ? (
                        <span
                          style={{
                            background: "rgba(255,217,61,0.15)",
                            color: "#ffd93d",
                            padding: "3px 10px",
                            borderRadius: "50px",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          {product.discountPercent}% OFF
                        </span>
                      ) : (
                        <span
                          style={{
                            color: "rgba(255,255,255,0.2)",
                            fontSize: "12px",
                          }}
                        >
                          —
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          color: product.stock > 0 ? "#4caf50" : "#f44336",
                        }}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          color: product.isFeatured
                            ? "#ffd93d"
                            : "rgba(255,255,255,0.2)",
                          fontSize: "18px",
                        }}
                      >
                        {product.isFeatured ? "⭐" : "—"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleEdit(product)}
                          style={{
                            background: "rgba(162,155,254,0.15)",
                            border: "1px solid rgba(162,155,254,0.3)",
                            color: "#a29bfe",
                            padding: "6px 14px",
                            borderRadius: "50px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(product._id, product.name)
                          }
                          style={{
                            background: "rgba(255,107,107,0.15)",
                            border: "1px solid rgba(255,107,107,0.3)",
                            color: "#ff6b6b",
                            padding: "6px 14px",
                            borderRadius: "50px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductsPage;
