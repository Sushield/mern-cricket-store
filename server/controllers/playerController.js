const Player = require('../models/Player')

const getPlayers = async (req, res) => {
  try {
    const players = await Player.find({}).sort({ createdAt: -1 }).populate('products');
    res.json({ success: true, players })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getPlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id).populate('products');
    if (!player) return res.status(404).json({ success: false, message: 'Player not found' })
    res.json({ success: true, player })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const createPlayer = async (req, res) => {
  try {
    const player = await Player.create(req.body)
    res.status(201).json({ success: true, player })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const updatePlayer = async (req, res) => {
  try {
    const player = await Player.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    )
    if (!player) return res.status(404).json({ success: false, message: 'Player not found' })
    res.json({ success: true, player })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const deletePlayer = async (req, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id)
    if (!player) return res.status(404).json({ success: false, message: 'Player not found' })
    res.json({ success: true, message: 'Player deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getPlayers, getPlayer, createPlayer, updatePlayer, deletePlayer }