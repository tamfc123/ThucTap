import Order from "../models/Order.js"
import Cart from "../models/Cart.js"
import Product from "../models/Product.js"

// Get all orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, size = 10, sort = "-createdAt", status, search } = req.query

    const query = {}
    if (status) {
      query.status = status
    }
    if (search) {
      query.code = { $regex: search, $options: "i" }
    }

    const skip = (page - 1) * size
    const limit = Number.parseInt(size)

    const orders = await Order.find(query)
      .populate("user", "username email fullname phone")
      .populate("orderItems.product")
      .populate("orderItems.variant")
      .sort(sort)
      .skip(skip)
      .limit(limit)

    const total = await Order.countDocuments(query)

    res.json({
      content: orders,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size: limit,
      number: Number.parseInt(page) - 1,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get my orders
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, size = 10, status } = req.query

    const query = { user: req.user._id }
    if (status) {
      query.status = status
    }

    const skip = (page - 1) * size
    const limit = Number.parseInt(size)

    const orders = await Order.find(query)
      .populate("orderItems.product")
      .populate("orderItems.variant")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)

    const total = await Order.countDocuments(query)

    res.json({
      content: orders,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size: limit,
      number: Number.parseInt(page) - 1,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "username email fullname phone")
      .populate("orderItems.product")
      .populate("orderItems.variant")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized to view this order" })
    }

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create order
export const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, note } = req.body

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" })
    }

    // Calculate total
    let totalAmount = 0
    for (const item of orderItems) {
      const product = await Product.findById(item.product)
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` })
      }
      totalAmount += product.price * item.quantity
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      note,
      totalAmount,
      code: `ORD${Date.now()}`,
      status: "PENDING",
    })

    await order.save()

    // Clear cart after order
    await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } })

    const populatedOrder = await Order.findById(order._id).populate("orderItems.product").populate("orderItems.variant")

    res.status(201).json(populatedOrder)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Update order status (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate("user", "username email fullname phone")
      .populate("orderItems.product")
      .populate("orderItems.variant")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.json(order)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this order" })
    }

    // Can only cancel pending orders
    if (order.status !== "PENDING") {
      return res.status(400).json({ message: "Cannot cancel order with current status" })
    }

    order.status = "CANCELLED"
    await order.save()

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export default {
  getAllOrders,
  getMyOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
}
