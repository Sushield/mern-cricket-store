const express = require("express");
const router = express.Router();
const {
  getBlogs,
  getAllBlogsAdmin,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  commentBlog,
  deleteComment,
} = require("../controllers/blogController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", getBlogs);
router.get("/admin/all", protect, admin, getAllBlogsAdmin);
router.get("/:slug", getBlog);
router.post("/", protect, admin, createBlog);
router.put("/:id", protect, admin, updateBlog);
router.delete("/:id", protect, admin, deleteBlog);
router.post("/:slug/like", protect, likeBlog);
router.post("/:slug/comment", protect, commentBlog);
router.delete("/:slug/comment/:commentId", protect, deleteComment);

module.exports = router;
