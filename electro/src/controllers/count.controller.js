import Count from "../models/Count.js"

export const getAll = async (req, res, next) => {
    try {
      const { page = 1, size = 10, sort = "-createdAt", search, status } = req.query
      const query = {}

      if (search) query.code = { $regex: search, $options: "i" }
      if (status) query.status = status

      const items = await Count.find(query)
        .sort(sort)
        .limit(size * 1)
        .skip((page - 1) * size)
        .populate("warehouse items.variant")

      const total = await Count.countDocuments(query)

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
      const item = await Count.findById(req.params.id).populate("warehouse items.variant")
      if (!item) {
        return res.status(404).json({ message: "Count not found" })
      }
      res.json(item)
    } catch (error) {
      next(error)
    }
  }

  export const create = async (req, res, next) => {
    try {
      const code = "CNT" + Date.now()
      const item = new Count({ ...req.body, code })
      await item.save()
      res.status(201).json(item)
    } catch (error) {
      next(error)
    }
  }

  export const update = async (req, res, next) => {
    try {
      const item = await Count.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      if (!item) {
        return res.status(404).json({ message: "Count not found" })
      }
      res.json(item)
    } catch (error) {
      next(error)
    }
  }

  export const deleteMany = async (req, res, next) => {
    try {
      const { ids } = req.body
      await Count.deleteMany({ _id: { $in: ids } })
      res.json({ message: "Counts deleted successfully" })
    } catch (error) {
      next(error)
    }
  }

export default { getAll, getById, create, update, deleteMany }