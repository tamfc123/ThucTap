import Category from "../models/Category.js"
import { getAll } from "./address.controller.js"
// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const { page = 1, size = 10, sort = "name", search } = req.query

    const query = {}
    if (search) {
      query.name = { $regex: search, $options: "i" }
    }

    const skip = (page - 1) * size
    const limit = Number.parseInt(size)

    const categories = await Category.find(query).sort(sort).skip(skip).limit(limit).lean()

    const total = await Category.countDocuments(query)
    const totalPages = Math.ceil(total / size)

    // 2. SỬA LẠI CẤU TRÚC JSON CHO ĐÚNG CHUẨN
    res.json({
      content: categories,
      totalElements: total,
      totalPages: totalPages,
      size: limit,
      page: Number.parseInt(page), // <-- Sửa 'number' thành 'page' (1-based)
      last: page >= totalPages,  // <-- Thêm 'last'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    res.json(category)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get category by slug
export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug })

    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    res.json(category)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create category
export const createCategory = async (req, res) => {
  try {
    const category = new Category(req.body)
    await category.save()
    res.status(201).json(category)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Update category
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    res.json(category)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id)

    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    res.json({ message: "Category deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export default {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
}