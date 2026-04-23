const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  description: { type: String },
  image: {
    url: String,
    public_id: String,
  },
  emoji: { type: String, default: '🏏' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('Category', categorySchema)