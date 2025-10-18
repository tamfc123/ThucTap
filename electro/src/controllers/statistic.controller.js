import Order from "../models/Order.js"
import Product from "../models/Product.js"
import User from "../models/User.js"
import Review from "../models/Review.js"

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments()
    const totalProducts = await Product.countDocuments()
    const totalUsers = await User.countDocuments({ role: "USER" })
    const totalRevenue = await Order.aggregate([
      { $match: { status: "DELIVERED" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ])

    const pendingOrders = await Order.countDocuments({ status: "PENDING" })
    const processingOrders = await Order.countDocuments({ status: "PROCESSING" })
    const shippingOrders = await Order.countDocuments({ status: "SHIPPING" })

    res.json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingOrders,
      processingOrders,
      shippingOrders,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get revenue statistics
export const getRevenueStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    const matchStage = { status: "DELIVERED" }
    if (startDate || endDate) {
      matchStage.createdAt = {}
      if (startDate) matchStage.createdAt.$gte = new Date(startDate)
      if (endDate) matchStage.createdAt.$lte = new Date(endDate)
    }

    const revenueByDay = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    res.json(revenueByDay)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get product statistics
export const getProductStats = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { status: "DELIVERED" } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          totalSold: { $sum: "$orderItems.quantity" },
          revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
    ])

    res.json(topProducts)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get customer statistics
export const getCustomerStats = async (req, res) => {
  try {
    const topCustomers = await Order.aggregate([
      { $match: { status: "DELIVERED" } },
      {
        $group: {
          _id: "$user",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ])

    res.json(topCustomers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export default { getDashboardStats, getRevenueStats, getProductStats, getCustomerStats }