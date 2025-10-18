import Order from "../models/Order.js"
import Product from "../models/Product.js"
import User from "../models/User.js"

export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const totalOrders = await Order.countDocuments()
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } })

    const totalRevenue = await Order.aggregate([
      { $match: { status: "COMPLETED" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ])

    const totalProducts = await Product.countDocuments()
    const totalUsers = await User.countDocuments({ role: "USER" })

    const recentOrders = await Order.find().sort("-createdAt").limit(10).populate("user", "fullName email")

    res.json({
      totalOrders,
      todayOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalProducts,
      totalUsers,
      recentOrders,
    })
  } catch (error) {
    next(error)
  }
}

export default { getDashboardStats }