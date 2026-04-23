const mongoose = require('mongoose')

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  country: { type: String, required: true },
  bio: { type: String, required: true },
  image: {
    url: String,
    public_id: String,
  },
  color: { type: String, default: '#00d4aa' },
  isFeatured: { type: Boolean, default: true },
  products: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }],
}, { timestamps: true })

module.exports = mongoose.model('Player', playerSchema)