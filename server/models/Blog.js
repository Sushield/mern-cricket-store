const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    text: { type: String, required: true },
    avatar: { type: String },
  },
  { timestamps: true },
);

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { url: String, public_id: String },
    media: [
      {
        type: { type: String, enum: ["image", "video", "youtube", "embed"] },
        url: String,
        public_id: String,
        caption: String,
      },
    ],
    tags: [String],
    author: { type: String, default: "Admin" },
    isPublished: { type: Boolean, default: false },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Blog", blogSchema);
