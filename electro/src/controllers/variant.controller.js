import Variant from "../models/Variant.js"

export const getAll = async (req, res, next) => {
    try {
      const { page = 1, size = 10, sort = "createdAt", search, productId } = req.query
      const query = {}

      if (search) query.sku = { $regex: search, $options: "i" }
      if (productId) query.product = productId

      const items = await Variant.find(query)
        .sort(sort)
        .limit(size * 1)
        .skip((page - 1) * size)
        .populate("product")

      const total = await Variant.countDocuments(query)

      res.json({
        content: items,
        totalElements: total,
        totalPages: Math.ceil(total / size),
        size: items.length,
      })
    } catch (error) {
      next(error)
    }
  }

  export const getById = async (req, res, next) => {
    try {
      const item = await Variant.findById(req.params.id).populate("product")
      if (!item) {
        return res.status(404).json({ message: "Variant not found" })
      }
      res.json(item)
    } catch (error) {
      next(error)
    }
  }

  export const create = async (req, res, next) => {
    try {
      const item = new Variant(req.body)
      await item.save()
      res.status(201).json(item)
    } catch (error) {
      next(error)
    }
  }

  export const update = async (req, res, next) => {
    try {
      const item = await Variant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      if (!item) {
        return res.status(404).json({ message: "Variant not found" })
      }
      res.json(item)
    } catch (error) {
      next(error)
    }
  }

  export const deleteMany = async (req, res, next) => {
    try {
      const { ids } = req.body
      await Variant.deleteMany({ _id: { $in: ids } })
      res.json({ message: "Variants deleted successfully" })
    } catch (error) {
      next(error)
    }
  }

export default { getAll, getById, create, update, deleteMany }