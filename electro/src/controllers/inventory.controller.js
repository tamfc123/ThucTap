import Product from "../models/Product.js"
import Variant from "../models/Variant.js"

export const getAllProductInventories = async (req, res, next) => {
    try {
      const { page = 1, size = 10, sort = "createdAt", search } = req.query
      const query = search ? { name: { $regex: search, $options: "i" } } : {}

      const products = await Product.find(query)
        .sort(sort)
        .limit(size * 1)
        .skip((page - 1) * size)
        .select("name sku inventory")

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

  export const getProductInventoryById = async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id).select("name sku inventory")
      if (!product) {
        return res.status(404).json({ message: "Product not found" })
      }
      res.json(product)
    } catch (error) {
      next(error)
    }
  }

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