import Product from "../models/Product.js"
import Category from "../models/Category.js"
import Brand from "../models/Brand.js"

// Get all products with filters
export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      size = 10,
      sort = "-createdAt",
      search,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      status,
    } = req.query

    const query = {}

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: "i" }
    }

    // Filter by category
    if (categoryId) {
      query.category = categoryId
    }

    // Filter by brand
    if (brandId) {
      query.brand = brandId
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    // Filter by status
    if (status) {
      query.status = status
    }

    const skip = (page - 1) * size
    const limit = Number.parseInt(size)

    const products = await Product.find(query)
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .populate("variants")
      .sort(sort)
      .skip(skip)
      .limit(limit)

    const total = await Product.countDocuments(query)

    res.json({
      content: products,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size: limit,
      number: Number.parseInt(page) - 1,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .populate("variants")
      .populate("specifications")
      .populate("properties")

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get product by slug
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .populate("variants")
      .populate("specifications")
      .populate("properties")

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create product
export const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body)
    await product.save()

    const populatedProduct = await Product.findById(product._id)
      .populate("category", "name slug")
      .populate("brand", "name slug")

    res.status(201).json(populatedProduct)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Update product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate("category", "name slug")
      .populate("brand", "name slug")

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json(product)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({ message: "Product deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export default {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
}