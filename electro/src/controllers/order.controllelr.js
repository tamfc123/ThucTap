import mongoose from "mongoose";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Variant from "../models/Variant.js";

// Get all orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      size = 10,
      sort = "-createdAt",
      status,
      search,
    } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.code = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * size;
    const limit = Number.parseInt(size);

    const orders = await Order.find(query)
      .populate("user", "username email fullname phone")
      .populate("orderItems.product")
      .populate("orderItems.variant")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.json({
      content: orders,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size: limit,
      number: Number.parseInt(page) - 1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my orders
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, size = 10, status } = req.query;

    const query = { user: req.user._id };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * size;
    const limit = Number.parseInt(size);

    const orders = await Order.find(query)
      .populate("orderItems.product")
      .populate("orderItems.variant")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.json({
      content: orders,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size: limit,
      number: Number.parseInt(page) - 1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "username email fullname phone")
      .populate("orderItems.product")
      .populate("orderItems.variant");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order or is admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "ADMIN"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create order
export const createOrder = async (req, res) => {
  // Bắt đầu một transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Lấy dữ liệu từ request và token
    const { cartId, paymentMethodType } = req.body;
    const userId = req.user._id;

    // 🔽🔽🔽 THÊM 2 DÒNG NÀY 🔽🔽🔽
    console.log("Đang tìm giỏ hàng với cartId:", cartId);
    console.log("Đang tìm giỏ hàng với userId:", userId);
    // 🔼🔼🔼 KẾT THÚC THÊM 🔼🔼🔼

    // 2. Lấy thông tin User (để lấy địa chỉ)
    const user = await User.findById(userId)
      .populate("address.wardId")     // Sửa 'ward' -> 'wardId'
      .populate("address.districtId") // Sửa 'district' -> 'districtId'
      .populate("address.provinceId") // Sửa 'province' -> 'provinceId'
      .session(session);

    if (!user) {
      throw new Error("Không tìm thấy người dùng.");
    }

    // 3. Lấy thông tin giỏ hàng
    const cart = await Cart.findOne({ _id: cartId, user: userId })
      .populate({
        path: "cartVariants.variant",
        populate: {
          path: "product",
          // populate: {
          //   path: "promotionId", // Lấy thông tin khuyến mãi
          // },
        },
      })
      .session(session);
    console.log('Cart fetched in createOrder:', cart);

    if (!cart || !cart.cartVariants || cart.cartVariants.length === 0) {
      throw new Error("Giỏ hàng rỗng.");
    }

    // 5. Lấy địa chỉ giao hàng từ User
    const { address } = user;
    if (
      !address ||
      !address.line ||
      !address.wardId ||     // Sửa 'ward' -> 'wardId'
      !address.districtId || // Sửa 'district' -> 'districtId'
      !address.provinceId    // Sửa 'province' -> 'provinceId'
    ) {
      throw new Error(
        "Vui lòng cập nhật địa chỉ giao hàng trước khi đặt hàng."
      );
    }
    const fullAddress = [
      address.line,
      address.wardId.name,     // Sửa 'ward' -> 'wardId'
      address.districtId.name, // Sửa 'district' -> 'districtId'
      address.provinceId.name, // Sửa 'province' -> 'provinceId'
    ].join(", ");

    // 6. Tính toán đơn hàng và chuẩn bị 'orderVariants'
    let totalAmount = 0;
    const orderVariants = [];

    // Helper (giống hệt frontend)
    const calculateDiscountedPrice = (price, percent) => {
      if (!percent || percent === 0) return price;
      return price - (price * percent) / 100;
    };

    for (const item of cart.cartVariants) {
      const variant = item.variant;
      const product = variant.product;

      if (!variant) throw new Error("Không tìm thấy một biến thể sản phẩm.");

      // Kiểm tra tồn kho
      if (variant.inventory < item.quantity) {
        throw new Error(
          `Sản phẩm '${product.name}' không đủ tồn kho (còn ${variant.inventory}).`
        );
      }

      const promotionPercent = 0;
      const finalPrice = calculateDiscountedPrice(
        variant.price,
        promotionPercent
      );
      const amount = finalPrice * item.quantity;

      totalAmount += amount;

      orderVariants.push({
        variant: variant._id,
        price: finalPrice,
        quantity: item.quantity,
        amount: amount,
      });

      // Trừ tồn kho
      variant.inventory -= item.quantity;
      await variant.save({ session });
    }

    // 7. Tính toán tổng tiền (giống hệt frontend)
    const TAX_RATE = 0.1; // Giả sử 10%
    const SHIPPING_COST = 0; // Tạm thời

    const tax = Math.round(totalAmount * TAX_RATE);
    const shippingCost = SHIPPING_COST;
    const totalPay = totalAmount + tax + shippingCost;

    // 8. Tạo đơn hàng mới
    const newOrder = new Order({
      code: `ORD${Date.now()}`,
      status: 1,
      toName: user.fullname,
      toPhone: user.phone,
      toAddress: address.line,
      toWardName: address.wardId.name,     // Sửa 'ward' -> 'wardId'
      toDistrictName: address.districtId.name, // Sửa 'district' -> 'districtId'
      toProvinceName: address.provinceId.name, // Sửa 'province' -> 'provinceId'

      orderResource: null, // <--- SỬA DÒNG NÀY (gán thẳng là null)

      note: null,
      user: userId,
      orderVariants: orderVariants,
      totalAmount: totalAmount,
      tax: tax,
      shippingCost: shippingCost,
      totalPay: totalPay,
      paymentMethodType: paymentMethodType,
      paymentStatus: 1,
    });

    await newOrder.save({ session });

    // 9. Xóa giỏ hàng
    await Cart.findByIdAndDelete(cartId).session(session);

    // 10. Commit transaction
    await session.commitTransaction();

    // 11. Chuẩn bị dữ liệu trả về cho frontend
    // (Phần này cần khớp với ClientConfirmedOrderResponse)

    let momoCheckoutLink = null;
    let paypalCheckoutLink = null;

    if (paymentMethodType === "MOMO") {
      // TODO: Gọi API Momo để tạo link thanh toán
      // momoCheckoutLink = ...
    }


    res.status(201).json({
      orderCode: newOrder.code,
      orderPaymentMethodType: newOrder.paymentMethodType,
      orderPaypalCheckoutLink: paypalCheckoutLink,
      orderMomoCheckoutLink: momoCheckoutLink,
    });
  } catch (error) {
    // Nếu có lỗi, rollback transaction
    await session.abortTransaction();
    res
      .status(400)
      .json({ message: error.message || "Tạo đơn hàng thất bại." });
  } finally {
    // Luôn luôn kết thúc session
    session.endSession();
  }
};

// Update order status (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("user", "username email fullname phone")
      .populate("orderItems.product")
      .populate("orderItems.variant");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this order" });
    }

    // Can only cancel pending orders
    if (order.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Cannot cancel order with current status" });
    }

    order.status = "CANCELLED";
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getAllOrders,
  getMyOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
};
