const Blog = require("../models/Blog");

const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true })
      .select("-content")
      .sort({ createdAt: -1 });
    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllBlogsAdmin = async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).populate(
      "comments.user",
      "name",
    );
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    blog.views += 1;
    await blog.save();
    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createBlog = async (req, res) => {
  try {
    const slug =
      req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now();
    const blog = await Blog.create({ ...req.body, slug });
    res.status(201).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: false },
    );
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    res.json({ success: true, message: "Blog deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    const userId = req.user._id;
    const liked = blog.likes.includes(userId);
    if (liked) {
      blog.likes = blog.likes.filter(
        (id) => id.toString() !== userId.toString(),
      );
    } else {
      blog.likes.push(userId);
    }
    await blog.save();
    res.json({ success: true, likes: blog.likes.length, liked: !liked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const commentBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    const comment = {
      user: req.user._id,
      name: req.user.name,
      text: req.body.text,
    };
    blog.comments.push(comment);
    await blog.save();
    res.status(201).json({ success: true, comments: blog.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    blog.comments = blog.comments.filter(
      (c) => c._id.toString() !== req.params.commentId,
    );
    await blog.save();
    res.json({ success: true, comments: blog.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBlogs,
  getAllBlogsAdmin,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  commentBlog,
  deleteComment,
};
