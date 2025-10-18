import Promotion from "../models/Promotion.js"

export const getAll = async (req, res, next) => {
    try {
      const { page = 1, size = 10, sort = "-createdAt", search, status } = req.query
      const query = {}

      if (search) query.name = { $regex: search, $options: "i" }
      if (status) query.status = status

      const items = await Promotion.find(query)
        .sort(sort)
        .limit(size * 1)
        .skip((page - 1) * size)
        .populate("products categories")

      const total = await Promotion.countDocuments(query)

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
      const item = await Promotion.findById(req.params.id).populate("products categories")
      if (!item) {
        return res.status(404).json({ message: "Promotion not found" })
      }
      res.json(item)
    } catch (error) {
      next(error)
    }
  }

  export const create = async (req, res, next) => {
    try {
      const item = new Promotion(req.body)
      await item.save()
      res.status(201).json(item)
    } catch (error) {
      next(error)
    }
  }

  export const update = async (req, res, next) => {
    try {
      const item = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      if (!item) {
        return res.status(404).json({ message: "Promotion not found" })
      }
      res.json(item)
    } catch (error) {
      next(error)
    }
  }

  export const deleteMany = async (req, res, next) => {
    try {
      const { ids } = req.body
      await Promotion.deleteMany({ _id: { $in: ids } })
      res.json({ message: "Promotions deleted successfully" })
    } catch (error) {
      next(error)
    }
  }

export default { getAll, getById, create, update, deleteMany }
