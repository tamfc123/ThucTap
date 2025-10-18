import Review from "../models/Review.js"
import Product from "../models/Product.js"
import Order from "../models/Order.js"
// Get all reviews (Admin)
export const getAllReviews = async (req, res) => {
  try {
    const { page = 1, size = 10, sort = "-createdAt" } = req.query

    const skip = (page - 1) * size
    const limit = Number.parseInt(size)

    const reviews = await Review.find()
      .populate("user", "username fullname")
      .populate("product", "name")
      .sort(sort)
      .skip(skip)
      .limit(limit)

    const total = await Review.countDocuments()

    res.json({
      content: reviews,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size: limit,
      number: Number.parseInt(page) - 1,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get product reviews
export const getProductReviews = async (req, res) => {
  try {
    const { page = 1, size = 10, sort = "-createdAt" } = req.query

    const skip = (page - 1) * size
    const limit = Number.parseInt(size)

    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "username fullname")
      .sort(sort)
      .skip(skip)
      .limit(limit)

    const total = await Review.countDocuments({ product: req.params.productId })

    res.json({
      content: reviews,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size: limit,
      number: Number.parseInt(page) - 1,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create review
export const createReview = async (req, res) => {
  try {
    const { product, rating, content } = req.body

    // Check if product exists
    const productExists = await Product.findById(product)
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Check if user has purchased this product
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      "orderItems.product": product,
      status: "DELIVERED",
    })

    if (!hasPurchased) {
      return res.status(400).json({ message: "You can only review products you have purchased" })
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user._id,
      product,
    })

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product" })
    }

    const review = new Review({
      user: req.user._id,
      product,
      rating,
      content,
    })

    await review.save()

    const populatedReview = await Review.findById(review._id).populate("user", "username fullname")

    res.status(201).json(populatedReview)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Update review
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({ message: "Review not found" })
    }

    // Check if user owns this review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this review" })
    }

    const { rating, content } = req.body
    review.rating = rating || review.rating
    review.content = content || review.content

    await review.save()

    const populatedReview = await Review.findById(review._id).populate("user", "username fullname")

    res.json(populatedReview)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({ message: "Review not found" })
    }

    // Check if user owns this review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized to delete this review" })
    }

    await review.deleteOne()

    res.json({ message: "Review deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export default {
  getAllReviews,
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
}