import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "../../utils/axios";
import toast from "react-hot-toast";

const AdminPlayersPage = () => {
  const { token } = useSelector((state) => state.auth);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPlayer, setEditPlayer] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    country: "",
    bio: "",
    color: "#00d4aa",
    isFeatured: true,
    products: [],
  });

  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    fetchPlayers();
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      const { data } = await axios.get("/products");
      setAllProducts(data.products);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data } = await axios.get("/players");
      setPlayers(data.players);
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
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
      let image = editPlayer?.image || {};

      if (imageFile) {
        const uploaded = await handleImageUpload();
        if (uploaded) image = uploaded;
      }

      const playerData = { ...formData, image };

      if (editPlayer) {
        await axios.put(`/players/${editPlayer._id}`, playerData, { headers });
        toast.success("Player updated!");
      } else {
        await axios.post("/players", playerData, { headers });
        toast.success("Player created!");
      }

      setShowForm(false);
      setEditPlayer(null);
      resetForm();
      fetchPlayers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    }
  };

  const handleEdit = (player) => {
    setEditPlayer(player);
    setFormData({
      name: player.name,
      role: player.role,
      country: player.country,
      bio: player.bio,
      color: player.color || "#00d4aa",
      isFeatured: player.isFeatured,
      products: player.products?.map((p) => p._id || p) || [],
    });
    setImagePreview(player.image?.url || null);
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await axios.delete(`/players/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Player deleted!");
      fetchPlayers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed!");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      country: "",
      bio: "",
      color: "#00d4aa",
      isFeatured: true,
      products: [],
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

  const colorOptions = [
    "#00d4aa",
    "#ff6b6b",
    "#ffd93d",
    "#a29bfe",
    "#fd79a8",
    "#74b9ff",
    "#55efc4",
    "#fdcb6e",
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
            👑 Manage Players
          </h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditPlayer(null);
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
            {showForm ? "✕ Cancel" : "+ Add Player"}
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
              {editPlayer ? "✏️ Edit Player" : "➕ Add New Player"}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Image Upload */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Player Image</label>
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
                      borderRadius: "50%",
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
                      <span style={{ fontSize: "3rem" }}>👤</span>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      id="playerImage"
                      style={{ display: "none" }}
                    />
                    <label
                      htmlFor="playerImage"
                      style={{
                        display: "inline-block",
                        background: "rgba(0,212,170,0.15)",
                        border: "1px solid rgba(0,212,170,0.4)",
                        color: "#00d4aa",
                        padding: "10px 20px",
                        borderRadius: "50px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      📷 Choose Photo
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
                  <label style={labelStyle}>Player Name</label>
                  <input
                    style={inputStyle}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Virat Kohli"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Role</label>
                  <input
                    style={inputStyle}
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="Batsman, Bowler..."
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Country (with flag emoji)</label>
                <input
                  style={inputStyle}
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="🇮🇳 India"
                  required
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Bio</label>
                <textarea
                  style={{
                    ...inputStyle,
                    minHeight: "80px",
                    resize: "vertical",
                  }}
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Brief description about the player..."
                  required
                />
              </div>

              {/* Color Picker */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Card Color</label>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {colorOptions.map((color) => (
                    <div
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: color,
                        cursor: "pointer",
                        border:
                          formData.color === color
                            ? "3px solid #fff"
                            : "3px solid transparent",
                        transition: "all 0.2s",
                      }}
                    />
                  ))}
                  {/* Custom color */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        border: "none",
                        cursor: "pointer",
                        padding: "0",
                        background: "none",
                      }}
                    />
                    <span
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "12px",
                      }}
                    >
                      Custom
                    </span>
                  </div>
                </div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "11px",
                    marginTop: "6px",
                  }}
                >
                  Selected:{" "}
                  <span style={{ color: formData.color }}>
                    {formData.color}
                  </span>
                </p>
              </div>
              {/* Associate Products */}
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
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
                  🏏 Associate Products
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "12px",
                    marginBottom: "1rem",
                  }}
                >
                  Select products used by this player
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "8px",
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  {allProducts.map((product) => {
                    const isSelected = formData.products.includes(product._id);
                    return (
                      <div
                        key={product._id}
                        onClick={() => {
                          const newProducts = isSelected
                            ? formData.products.filter(
                                (id) => id !== product._id,
                              )
                            : [...formData.products, product._id];
                          setFormData({ ...formData, products: newProducts });
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px",
                          borderRadius: "10px",
                          cursor: "pointer",
                          background: isSelected
                            ? "rgba(0,212,170,0.15)"
                            : "rgba(255,255,255,0.04)",
                          border: isSelected
                            ? "1px solid rgba(0,212,170,0.5)"
                            : "1px solid rgba(255,255,255,0.08)",
                          transition: "all 0.2s",
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            flexShrink: 0,
                            background: "rgba(255,255,255,0.06)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
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
                            <span style={{ fontSize: "1.2rem" }}>🏏</span>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              color: isSelected ? "#00d4aa" : "#fff",
                              fontSize: "12px",
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
                              fontSize: "11px",
                            }}
                          >
                            Rs. {product.discountedPrice || product.price}
                          </p>
                        </div>
                        {isSelected && (
                          <span
                            style={{
                              color: "#00d4aa",
                              fontSize: "16px",
                              flexShrink: 0,
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {formData.products.length > 0 && (
                  <p
                    style={{
                      color: "#00d4aa",
                      fontSize: "12px",
                      marginTop: "10px",
                    }}
                  >
                    ✓ {formData.products.length} product(s) selected
                  </p>
                )}
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
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  id="playerFeatured"
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <label
                  htmlFor="playerFeatured"
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Show on Homepage
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
                  : editPlayer
                    ? "✓ Update Player"
                    : "+ Add Player"}
              </button>
            </form>
          </div>
        )}

        {/* Players Grid */}
        {loading ? (
          <p style={{ color: "#aaa" }}>Loading...</p>
        ) : players.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "4rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>👤</div>
            <p style={{ color: "rgba(255,255,255,0.4)" }}>No players yet</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1.2rem",
            }}
          >
            {players.map((player) => (
              <div
                key={player._id}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${player.color}44`,
                  borderRadius: "16px",
                  padding: "1.5rem",
                  borderTop: `3px solid ${player.color}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: `${player.color}22`,
                      border: `2px solid ${player.color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
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
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: "1.8rem" }}>👤</span>
                    )}
                  </div>
                  <div>
                    <p
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "15px",
                      }}
                    >
                      {player.name}
                    </p>
                    <p style={{ color: player.color, fontSize: "12px" }}>
                      {player.role}
                    </p>
                    <p
                      style={{
                        color: "rgba(243, 239, 6, 0.86)",
                        fontSize: "12px",
                      }}
                    >
                      {player.country}
                    </p>
                  </div>
                </div>
                <p
                  style={{
                    color: "rgba(252, 252, 252, 0.95)",
                    fontSize: "10px",
                    lineHeight: 1.5,
                    marginBottom: "1rem",
                  }}
                >
                  {player.bio}
                </p>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => handleEdit(player)}
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
                    onClick={() => handleDelete(player._id, player.name)}
                    style={{
                      background: "rgba(233, 225, 225, 0.9)",
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPlayersPage;
