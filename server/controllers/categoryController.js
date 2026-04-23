const Category = require('../models/Category')

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ order: 1 })
    res.json({ success: true, categories })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' })
    res.json({ success: true, category })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body)
    res.status(201).json({ success: true, category })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: false }
    )
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' })
    res.json({ success: true, category })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id)
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' })
    res.json({ success: true, message: 'Category deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory }