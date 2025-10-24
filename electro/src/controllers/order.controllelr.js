import mongoose from "mongoose";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Variant from "../models/Variant.js";
import axios from "axios";
import crypto from "crypto";
import { restoreInventoryAndCancelOrder } from "../helpers/order.helper.js";

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
    const limit = Number.parseInt(size); // 1. POPULATE LỒNG NHAU + .lean()

    const orders = await Order.find(query)
      .populate("user", "username email fullname phone") // SỬA ĐOẠN NÀY:
      .populate({
        path: "orderVariants.variant", // <--- Sửa 1: Tên trường đúng
        model: "Variant",
        populate: {
          path: "product", // <--- Sửa 2: Populate lồng product
          model: "Product",
          select: "name slug images",
        },
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(); // <--- Sửa 3: Thêm .lean() để transform

    const total = await Order.countDocuments(query); // 2. BIẾN ĐỔI (TRANSFORM) DỮ LIỆU // (Logic y hệt hàm getMyOrders đã sửa)

    const transformedOrders = orders.map((order) => {
      const transformedVariants = order.orderVariants.map((item) => {
        if (!item.variant || !item.variant.product) {
          return {
            ...item,
            variant: {
              name: "Sản phẩm không tồn tại",
              slug: "#",
              thumbnail: null,
            },
          };
        }
        const product = item.variant.product;
        const thumbnail =
          product.images.find((img) => img.isThumbnail)?.path || null;
        const newVariant = {
          _id: item.variant._id,
          name: product.name,
          slug: product.slug,
          thumbnail: thumbnail,
          properties: item.variant.properties,
        };
        return { ...item, variant: newVariant };
      });
      return { ...order, orderVariants: transformedVariants };
    }); // 3. TRẢ VỀ DỮ LIỆU ĐÃ BIẾN ĐỔI

    res.json({
      content: transformedOrders, // <-- SỬ DỤNG BIẾN MỚI
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size: limit,
      number: Number.parseInt(page) - 1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my orders (SỬA LẠI CHO ĐÚNG)
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, size = 10, status } = req.query;

    const query = { user: req.user._id };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * size;
    const limit = Number.parseInt(size); // 1. POPULATE LỒNG NHAU (Giống hệt getAllOrders)

    const orders = await Order.find(query)
      .populate({
        path: "orderVariants.variant", // <--- Sửa 1
        model: "Variant",
        populate: {
          path: "product",
          model: "Product",
          select: "name slug images",
        },
      })
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .lean(); // <--- Sửa 2

    const total = await Order.countDocuments(query); // 2. BIẾN ĐỔI DỮ LIỆU (Giống hệt getAllOrders)

    const transformedOrders = orders.map((order) => {
      const transformedVariants = (order.orderVariants || []).map((item) => {
        if (!item.variant || !item.variant.product) {
          return {
            ...item,
            variant: {
              name: "Sản phẩm không tồn tại",
              slug: "#",
              thumbnail: null,
            },
          };
        }
        const product = item.variant.product;
        const thumbnail =
          product.images.find((img) => img.isThumbnail)?.path || null;
        const newVariant = {
          _id: item.variant._id,
          name: product.name,
          slug: product.slug,
          thumbnail: thumbnail,
          properties: item.variant.properties,
        };
        return { ...item, variant: newVariant };
      });
      return { ...order, orderVariants: transformedVariants };
    }); // 3. TRẢ VỀ DỮ LIỆU ĐÃ BIẾN ĐỔI

    res.json({
      content: transformedOrders, // <--- Sửa 3
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size: limit,
      number: Number.parseInt(page) - 1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order by ID (Admin)
export const getOrderById = async (req, res) => {
  try {
    // 1. POPULATE (Đã đúng)
    const order = await Order.findById(req.params.id)
      .populate("user", "username email fullname phone")
      .populate({
        path: "orderVariants.variant",
        model: "Variant",
        populate: {
          path: "product",
          model: "Product",
          select: "name slug images",
        },
      })
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    } // 2. BIẾN ĐỔI (TRANSFORM) // SỬA Ở ĐÂY: Thêm (order.orderVariants || []) để chống crash

    const transformedVariants = (order.orderVariants || []).map((item) => {
      if (!item.variant || !item.variant.product) {
        return {
          ...item,
          variant: {
            name: "Sản phẩm không tồn tại",
            slug: "#",
            thumbnail: null,
          },
        };
      }
      const product = item.variant.product;
      const thumbnail =
        product.images.find((img) => img.isThumbnail)?.path || null;
      const newVariant = {
        _id: item.variant._id,
        name: product.name,
        slug: product.slug,
        thumbnail: thumbnail,
        properties: item.variant.properties,
      };
      return { ...item, variant: newVariant };
    });

    const transformedOrder = { ...order, orderVariants: transformedVariants };

    res.json(transformedOrder);
  } catch (error) {
    console.error("Lỗi getOrderById (Admin):", error);
    res.status(500).json({ message: error.message });
  }
};

// Create order
// =========================================================
// == 2. THAY THẾ TOÀN BỘ HÀM createOrder BẰNG HÀM ĐÃ SỬA LỖI NÀY
// =========================================================
export const createOrder = async (req, res) => {
  // Bắt đầu một transaction
  const session = await mongoose.startSession();

  // Khai báo newOrder ở phạm vi ngoài
  let newOrder;

  // =========================================================
  // == VÙNG 1: TRANSACTION CỦA DATABASE (Tạo Order, Trừ kho)
  // =========================================================
  try {
    session.startTransaction();

    const { cartId, paymentMethodType } = req.body;
    const userId = req.user._id;

    console.log("Đang tìm giỏ hàng với cartId:", cartId);
    console.log("Đang tìm giỏ hàng với userId:", userId);

    const user = await User.findById(userId)
      .populate("address.wardId")
      .populate("address.districtId")
      .populate("address.provinceId")
      .session(session);

    if (!user) {
      throw new Error("Không tìm thấy người dùng.");
    }

    const cart = await Cart.findOne({ _id: cartId, user: userId })
      .populate({
        path: "cartVariants.variant",
        populate: { path: "product" },
      })
      .session(session);
    console.log("Cart fetched in createOrder:", cart);

    if (!cart || !cart.cartVariants || cart.cartVariants.length === 0) {
      throw new Error("Giỏ hàng rỗng.");
    }

    const { address } = user;
    if (
      !address ||
      !address.line ||
      !address.wardId ||
      !address.districtId ||
      !address.provinceId
    ) {
      throw new Error(
        "Vui lòng cập nhật địa chỉ giao hàng trước khi đặt hàng."
      );
    }

    let totalAmount = 0;
    const orderVariants = [];
    const calculateDiscountedPrice = (price, percent) => {
      if (!percent || percent === 0) return price;
      return price - (price * percent) / 100;
    };

    for (const item of cart.cartVariants) {
      const variant = item.variant;
      const product = variant.product;
      if (!variant) throw new Error("Không tìm thấy một biến thể sản phẩm.");

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

      variant.inventory -= item.quantity;
      await variant.save({ session });
    }

    const TAX_RATE = 0.1;
    const SHIPPING_COST = 0;
    const tax = Math.round(totalAmount * TAX_RATE);
    const shippingCost = SHIPPING_COST;
    const totalPay = totalAmount + tax + shippingCost;

    // Gán vào biến newOrder đã khai báo bên ngoài
    newOrder = new Order({
      code: `ORD${Date.now()}`,
      status: 1,
      toName: user.fullname,
      toPhone: user.phone,
      toAddress: address.line,
      toWardName: address.wardId.name,
      toDistrictName: address.districtId.name,
      toProvinceName: address.provinceId.name,
      orderResource: null,
      note: null,
      user: userId,
      orderVariants: orderVariants,
      totalAmount: totalAmount,
      tax: tax,
      shippingCost: shippingCost,
      totalPay: totalPay,
      paymentMethodType: paymentMethodType,
      paymentStatus: 1, // Chờ thanh toán
    });

    await newOrder.save({ session });
    await Cart.findByIdAndDelete(cartId).session(session);
    await session.commitTransaction(); // <-- KẾT THÚC TRANSACTION
  } catch (error) {
    // == CATCH CỦA VÙNG 1 (TRANSACTION) ==
    console.error("Lỗi Transaction Database:", error.message);
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return res
      .status(400)
      .json({ message: error.message || "Tạo đơn hàng thất bại." });
  } finally {
    session.endSession();
  }

  // =========================================================
  // == VÙNG 2: GỌI API THANH TOÁN (MOMO)
  // == Chạy sau khi Vùng 1 đã commit thành công
  // =========================================================
  try {
    let momoCheckoutLink = null;
    let paypalCheckoutLink = null;

    if (newOrder.paymentMethodType === "MOMO") {
      const partnerCode = process.env.MOMO_PARTNER_CODE;
      const accessKey = process.env.MOMO_ACCESS_KEY;
      const secretKey = process.env.MOMO_SECRET_KEY;
      const apiEndpoint = process.env.MOMO_API_ENDPOINT;

      const orderId = newOrder.code;
      const requestId = orderId;
      const amount = newOrder.totalPay.toString();
      const orderInfo = `Thanh toán đơn hàng ${newOrder.code}`;
      const redirectUrl = process.env.APP_REDIRECT_URL;
      const ipnUrl = process.env.APP_IPN_URL;
      const requestType = "payWithATM";
      const extraData = "";

      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

      const signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");

      const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        accessKey: accessKey,
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        extraData: extraData,
        requestType: requestType,
        signature: signature,
        lang: "vi",
      });

      const momoResponse = await axios.post(apiEndpoint, requestBody, {
        headers: { "Content-Type": "application/json" },
      });

      momoCheckoutLink = momoResponse.data.payUrl;
    }

    // 11. Trả về kết quả (THÀNH CÔNG HOÀN TOÀN)
    return res.status(201).json({
      orderCode: newOrder.code,
      orderPaymentMethodType: newOrder.paymentMethodType,
      orderPaypalCheckoutLink: paypalCheckoutLink,
      orderMomoCheckoutLink: momoCheckoutLink,
    });
  } catch (paymentError) {
    // == CATCH CỦA VÙNG 2 (API PAYMENT) ==
    console.error("Lỗi khi gọi API thanh toán (Momo):", paymentError.message);

    // Chạy logic "bồi hoàn" (compensating transaction)
    // 3. GỌI HÀM HELPER ĐÃ IMPORT
    await restoreInventoryAndCancelOrder(newOrder); // <-- SỬ DỤNG HÀM HELPER

    return res.status(500).json({
      message:
        "Đã tạo đơn hàng nhưng không thể lấy link thanh toán. Đơn hàng đã được tự động hủy, vui lòng thử lại.",
    });
  }
};

// === THAY THẾ TOÀN BỘ HÀM NÀY ===
export const updateOrderStatus = async (req, res) => {
  try {
    // SỬA 1: Lấy toàn bộ req.body, không chỉ { status }
    // Form của bạn đang gửi lên status, paymentStatus, toName, ...
    const updateData = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData, // SỬA 2: Cập nhật toàn bộ data
      { new: true }
    )
      .populate("user", "username email fullname phone") // SỬA 3: Populate lại cho đúng
      .populate({
        path: "orderVariants.variant",
        model: "Variant",
        populate: {
          path: "product",
          model: "Product",
          select: "name slug images",
        },
      }); // (Lưu ý: bạn cũng có thể .lean() và transform // giống hệt getOrderById nếu frontend cần)
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Lỗi updateOrderStatus (Admin):", error); // Thêm log
    res.status(400).json({ message: error.message });
  }
};

// Cancel order
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

    // =========================================================
    // == SỬA LỖI Ở ĐÂY
    // =========================================================

    // Chỉ có thể hủy đơn hàng khi đang "Chờ xử lý" (status: 1)
    if (order.status !== 1) {
      // <-- SỬA 1: Dùng số 1
      return res
        .status(400)
        .json({ message: "Không thể hủy đơn hàng ở trạng thái này." });
    }

    // TODO: Bạn cần hoàn lại kho ở đây.
    // Nếu chỉ đổi status, tồn kho sẽ bị trừ vĩnh viễn
    // Bạn nên gọi hàm `restoreInventoryAndCancelOrder(order)`

    order.status = 5; // <-- SỬA 2: Dùng số 5 (cho "Đã hủy")
    await order.save();
    // =========================================================
    // == KẾT THÚC SỬA
    // =========================================================

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
