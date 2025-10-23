import Product from "../models/Product.js"
import Variant from "../models/Variant.js"

// --- Hàm đã được sửa đúng ---
export const getAllProductInventories = async (req, res, next) => {
  try {
    const { page = 1, size = 10, sort = "createdAt", search } = req.query
    const query = search ? { name: { $regex: search, $options: "i" } } : {}

    const products = await Product.find(query)
      .sort(sort)
      .limit(size * 1)
      .skip((page - 1) * size)

      // SỬA: Dùng brandId và supplierId để populate (Do tên trong Product Model là Id)
      .populate("brandId", "name")
      .populate("supplierId", "displayName")

      // SỬA: Chỉ chọn các trường mà Front-end cần và Backend cung cấp
      .select("code name inventory brandId supplierId")

    const total = await Product.countDocuments(query)

    res.json({
      content: products,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size: products.length,
    })
  } catch (error) {
    // Nên thêm log lỗi để debug
    console.error("Error in getAllProductInventories:", error);
    next(error)
  }
}
// -----------------------------

// --- Hàm cần sửa đổi để lấy đủ Brand/Supplier ---
export const getProductInventoryById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      // BỔ SUNG: populate để lấy Brand/Supplier cho chi tiết sản phẩm (nếu có)
      .populate("brandId", "name")
      .populate("supplierId", "displayName")
      // BỔ SUNG: select các trường cần thiết
      .select("code name inventory brandId supplierId")

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }
    res.json(product)
  } catch (error) {
    next(error)
  }
}
// -----------------------------

// --- Các hàm khác giữ nguyên vì chúng liên quan đến Variant, không cần sửa ---
export const getAllVariantInventories = async (req, res, next) => {
  try {
    const { page = 1, size = 10, sort = "createdAt", search, productId } = req.query
    const query = {}

    if (search) query.sku = { $regex: search, $options: "i" }
    if (productId) query.product = productId

    const variants = await Variant.find(query)
      .sort(sort)
      .limit(size * 1)
      .skip((page - 1) * size)
      .populate("product", "name")
      .select("sku inventory product")

    const total = await Variant.countDocuments(query)

    res.json({
      content: variants,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size: variants.length,
    })
  } catch (error) {
    next(error)
  }
}

export const getVariantInventoryById = async (req, res, next) => {
  try {
    const variant = await Variant.findById(req.params.id).populate("product", "name").select("sku inventory product")
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" })
    }
    res.json(variant)
  } catch (error) {
    next(error)
  }
}

export default { getAllProductInventories, getProductInventoryById, getAllVariantInventories, getVariantInventoryById }