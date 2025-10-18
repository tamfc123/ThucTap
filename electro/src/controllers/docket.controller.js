import Docket from "../models/Docket.js"

export const getAll = async (req, res, next) => {
    try {
      const { page = 1, size = 10, sort = "-createdAt", search, status, type } = req.query
      const query = {}

      if (search) query.code = { $regex: search, $options: "i" }
      if (status) query.status = status
      if (type) query.type = type

      const items = await Docket.find(query)
        .sort(sort)
        .limit(size * 1)
        .skip((page - 1) * size)
        .populate("warehouse reason items.variant")

      const total = await Docket.countDocuments(query)

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
      const item = await Docket.findById(req.params.id).populate("warehouse reason items.variant")
      if (!item) {
        return res.status(404).json({ message: "Docket not found" })
      }
      res.json(item)
    } catch (error) {
      next(error)
    }
  }

  export const create = async (req, res, next) => {
    try {
      const code = "DK" + Date.now()
      const item = new Docket({ ...req.body, code })
      await item.save()
      res.status(201).json(item)
    } catch (error) {
      next(error)
    }
  }

  export const update = async (req, res, next) => {
    try {
      const item = await Docket.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      if (!item) {
        return res.status(404).json({ message: "Docket not found" })
      }
      res.json(item)
    } catch (error) {
      next(error)
    }
  }

  export const deleteMany = async (req, res, next) => {
    try {
      const { ids } = req.body
      await Docket.deleteMany({ _id: { $in: ids } })
      res.json({ message: "Dockets deleted successfully" })
    } catch (error) {
      next(error)
    }
  }

export default { getAll, getById, create, update, deleteMany }