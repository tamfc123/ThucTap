import Product from "../models/Product.js"
import Category from "../models/Category.js"
import User from "../models/User.js"
import Cart from "../models/Cart.js"
import Order from "../models/Order.js"
import Review from "../models/Review.js"
import Wishlist from "../models/Wishlist.js"
import Preorder from "../models/Preorder.js"
import Notification from "../models/Notification.js"
import PaymentMethod from "../models/PaymentMethod.js"
import Room from "../models/Room.js"
import Reward from "../models/Reward.js"

// Categories
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ status: 1 })
      .select("name slug description image parentCategory")
      .populate("parentCategory", "name slug")
    res.json(categories)
  } catch (error) {
    next(error)
  }
}

export const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, status: 1 }).populate(
      "parentCategory",
      "name slug",
    )
    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }
    res.json(category)
  } catch (error) {
    next(error)
  }
}

// Products
export const getProducts = async (req, res, next) => {
  try {
    const { page = 1, size = 12, sort = "-createdAt", category, brand, minPrice, maxPrice, search } = req.query
    const query = { status: 1 }

    if (category) query.category = category
    if (brand) query.brand = brand
    if (search) query.$text = { $search: search }
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    const products = await Product.find(query)
      .sort(sort)
      .limit(size * 1)
      .skip((page - 1) * size)
      .populate("categoryId brandId")
      .select("-__v")

    const total = await Product.countDocuments(query)

    res.json({
      content: products,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size: products.length,
    })
  } catch (error) {
    next(error)
  }
}

export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, status: 1 }).populate(
      "categoryId brandId variants specifications",
    )

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Increment view count
    product.views = (product.views || 0) + 1
    await product.save()

    res.json(product)
  } catch (error) {
    next(error)
  }
}

// Filters
export const getFiltersByCategory = async (req, res, next) => {
  try {
    const { slug } = req.query
    const category = await Category.findOne({ slug })

    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    const brands = await Product.distinct("brand", { category: category._id })
    const priceRange = await Product.aggregate([
      { $match: { category: category._id } },
      { $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } },
    ])

    res.json({
      brands,
      priceRange: priceRange[0] || { min: 0, max: 0 },
    })
  } catch (error) {
    next(error)
  }
}

export const getFiltersBySearch = async (req, res, next) => {
  try {
    const { search } = req.query
    const query = search ? { $text: { $search: search } } : {}

    const brands = await Product.distinct("brand", query)
    const categories = await Product.distinct("category", query)

    res.json({ brands, categories })
  } catch (error) {
    next(error)
  }
}

// User Info & Settings
export const getUserInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    res.json(user)
  } catch (error) {
    next(error)
  }
}

export const updatePersonalInfo = async (req, res, next) => {
  try {
    const { fullName, gender, dateOfBirth, avatar } = req.body
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, gender, dateOfBirth, avatar },
      { new: true, runValidators: true },
    ).select("-password")
    res.json(user)
  } catch (error) {
    next(error)
  }
}

export const updatePhone = async (req, res, next) => {
  try {
    const { phone } = req.body
    const user = await User.findByIdAndUpdate(req.user.id, { phone }, { new: true, runValidators: true }).select(
      "-password",
    )
    res.json(user)
  } catch (error) {
    next(error)
  }
}

export const updateEmail = async (req, res, next) => {
  try {
    const { email } = req.body
    const user = await User.findByIdAndUpdate(req.user.id, { email }, { new: true, runValidators: true }).select(
      "-password",
    )
    res.json(user)
  } catch (error) {
    next(error)
  }
}

export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user.id)

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" })
    }

    user.password = newPassword
    await user.save()

    res.json({ message: "Password updated successfully" })
  } catch (error) {
    next(error)
  }
}
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categoryId brandId variants specifications");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Optional: tăng view
    product.views = (product.views || 0) + 1;
    await product.save();

    res.json(product);
  } catch (error) {
    next(error);
  }
};


// Wishlist
export const getWishlist = async (req, res, next) => {
  try {
    const { page = 1, size = 10 } = req.query
    const wishlist = await Wishlist.find({ user: req.user.id })
      .populate("product")
      .limit(size * 1)
      .skip((page - 1) * size)

    const total = await Wishlist.countDocuments({ user: req.user.id })

    res.json({
      content: wishlist,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    })
  } catch (error) {
    next(error)
  }
}

export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body
    const existing = await Wishlist.findOne({ user: req.user.id, product: productId })

    if (existing) {
      return res.status(400).json({ message: "Product already in wishlist" })
    }

    const wishlist = new Wishlist({ user: req.user.id, product: productId })
    await wishlist.save()
    res.status(201).json(wishlist)
  } catch (error) {
    next(error)
  }
}

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { ids } = req.body
    await Wishlist.deleteMany({ _id: { $in: ids }, user: req.user.id })
    res.json({ message: "Removed from wishlist" })
  } catch (error) {
    next(error)
  }
}

// Preorders
export const getPreorders = async (req, res, next) => {
  try {
    const { page = 1, size = 10 } = req.query
    const preorders = await Preorder.find({ user: req.user.id })
      .populate("product")
      .limit(size * 1)
      .skip((page - 1) * size)

    const total = await Preorder.countDocuments({ user: req.user.id })

    res.json({
      content: preorders,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    })
  } catch (error) {
    next(error)
  }
}

export const createPreorder = async (req, res, next) => {
  try {
    const preorder = new Preorder({ ...req.body, user: req.user.id })
    await preorder.save()
    res.status(201).json(preorder)
  } catch (error) {
    next(error)
  }
}

export const updatePreorder = async (req, res, next) => {
  try {
    const { id, ...updateData } = req.body
    const preorder = await Preorder.findOneAndUpdate({ _id: id, user: req.user.id }, updateData, { new: true })
    res.json(preorder)
  } catch (error) {
    next(error)
  }
}

export const deletePreorders = async (req, res, next) => {
  try {
    const { ids } = req.body
    await Preorder.deleteMany({ _id: { $in: ids }, user: req.user.id })
    res.json({ message: "Preorders deleted" })
  } catch (error) {
    next(error)
  }
}

// Reviews
export const getUserReviews = async (req, res, next) => {
  try {
    const { page = 1, size = 10 } = req.query
    const reviews = await Review.find({ user: req.user.id })
      .populate("product")
      .limit(size * 1)
      .skip((page - 1) * size)

    const total = await Review.countDocuments({ user: req.user.id })

    res.json({
      content: reviews,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    })
  } catch (error) {
    next(error)
  }
}

export const getProductReviews = async (req, res, next) => {
  try {
    const { page = 1, size = 10 } = req.query
    const product = await Product.findOne({ slug: req.params.slug })

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    const reviews = await Review.find({ product: product._id, status: "APPROVED" })
      .populate("user", "fullName avatar")
      .limit(size * 1)
      .skip((page - 1) * size)
      .sort("-createdAt")

    const total = await Review.countDocuments({ product: product._id, status: "APPROVED" })

    res.json({
      content: reviews,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    })
  } catch (error) {
    next(error)
  }
}

export const createReview = async (req, res, next) => {
  try {
    const review = new Review({ ...req.body, user: req.user.id })
    await review.save()
    res.status(201).json(review)
  } catch (error) {
    next(error)
  }
}

export const deleteReviews = async (req, res, next) => {
  try {
    const { ids } = req.body
    await Review.deleteMany({ _id: { $in: ids }, user: req.user.id })
    res.json({ message: "Reviews deleted" })
  } catch (error) {
    next(error)
  }
}

// Notifications
export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, size = 10 } = req.query
    const notifications = await Notification.find({ user: req.user.id })
      .sort("-createdAt")
      .limit(size * 1)
      .skip((page - 1) * size)

    const total = await Notification.countDocuments({ user: req.user.id })

    res.json({
      content: notifications,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    })
  } catch (error) {
    next(error)
  }
}

export const initNotificationEvents = async (req, res, next) => {
  try {
    const eventSourceUuid = require("crypto").randomUUID()
    res.json({ eventSourceUuid })
  } catch (error) {
    next(error)
  }
}

export const updateNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, {
      new: true,
    })
    res.json(notification)
  } catch (error) {
    next(error)
  }
}

// Cart
export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product items.variant")
    res.json(cart || { items: [] })
  } catch (error) {
    next(error)
  }
}

export const saveCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })

    if (cart) {
      cart.items = req.body.items
      await cart.save()
    } else {
      cart = new Cart({ user: req.user.id, items: req.body.items })
      await cart.save()
    }

    res.json(cart)
  } catch (error) {
    next(error)
  }
}

export const removeFromCart = async (req, res, next) => {
  try {
    const { itemIds } = req.body
    const cart = await Cart.findOne({ user: req.user.id })

    if (cart) {
      cart.items = cart.items.filter((item) => !itemIds.includes(item._id.toString()))
      await cart.save()
    }

    res.json(cart)
  } catch (error) {
    next(error)
  }
}

// Orders
export const getOrders = async (req, res, next) => {
  try {
    const { page = 1, size = 10, status } = req.query
    const query = { user: req.user.id }
    if (status) query.status = status

    const orders = await Order.find(query)
      .sort("-createdAt")
      .limit(size * 1)
      .skip((page - 1) * size)
      .populate("items.product")

    const total = await Order.countDocuments(query)

    res.json({
      content: orders,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    })
  } catch (error) {
    next(error)
  }
}

export const getOrderByCode = async (req, res, next) => {
  try {
    const order = await Order.findOne({ code: req.params.code, user: req.user.id }).populate(
      "items.product items.variant paymentMethod",
    )

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.json(order)
  } catch (error) {
    next(error)
  }
}

export const createOrder = async (req, res, next) => {
  try {
    const orderCode = "ORD" + Date.now()
    const order = new Order({
      ...req.body,
      user: req.user.id,
      code: orderCode,
      status: "PENDING",
    })
    await order.save()

    // Clear cart after order
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] })

    res.status(201).json(order)
  } catch (error) {
    next(error)
  }
}

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ code: req.params.code, user: req.user.id })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    if (order.status !== "PENDING") {
      return res.status(400).json({ message: "Cannot cancel this order" })
    }

    order.status = "CANCELLED"
    await order.save()

    res.json(order)
  } catch (error) {
    next(error)
  }
}

// Payment Methods
export const getPaymentMethods = async (req, res, next) => {
  try {
    const paymentMethods = await PaymentMethod.find({ status: 1 })
    res.json(paymentMethods)
  } catch (error) {
    next(error)
  }
}

// Chat
export const getChatRoom = async (req, res, next) => {
  try {
    const room = await Room.findOne({ user: req.user.id })
    res.json(room)
  } catch (error) {
    next(error)
  }
}

export const createChatRoom = async (req, res, next) => {
  try {
    let room = await Room.findOne({ user: req.user.id })

    if (!room) {
      room = new Room({ user: req.user.id, name: `Room ${req.user.id}` })
      await room.save()
    }

    res.json(room)
  } catch (error) {
    next(error)
  }
}

// Rewards
export const getRewards = async (req, res, next) => {
  try {
    const rewards = await Reward.find({ user: req.user.id })
    res.json(rewards)
  } catch (error) {
    next(error)
  }
}

export default {
  getCategories,
  getCategoryBySlug,
  getProducts,
  getProductBySlug,
  getFiltersByCategory,
  getFiltersBySearch,
  getUserInfo,
  updatePersonalInfo,
  updatePhone,
  updateEmail,
  updatePassword,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getPreorders,
  createPreorder,
  updatePreorder,
  deletePreorders,
  getUserReviews,
  getProductReviews,
  createReview,
  deleteReviews,
  getNotifications,
  initNotificationEvents,
  updateNotification,
  getCart,
  saveCart,
  removeFromCart,
  getOrders,
  getOrderByCode,
  createOrder,
  cancelOrder,
  getPaymentMethods,
  getChatRoom,
  createChatRoom,
  getRewards,
  getProductById
}