import Waybill from "../models/Waybill.js"

export const getAll = async (req, res, next) => {
    try {
      const { page = 1, size = 10, sort = "-createdAt", search, status } = req.query
      const query = {}

      if (search) query.code = { $regex: search, $options: "i" }
      if (status) query.status = status

      const items = await Waybill.find(query)
        .sort(sort)
        .limit(size * 1)
        .skip((page - 1) * size)
        .populate("order")

      const total = await Waybill.countDocuments(query)

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
      const item = await Waybill.findById(req.params.id).populate("order")
      if (!item) {
        return res.status(404).json({ message: "Waybill not found" })
      }
      res.json(item)
    } catch (error) {
      next(error)
    }
  }

  export const create = async (req, res, next) => {
    try {
      const code = "WB" + Date.now()
      const item = new Waybill({ ...req.body, code })
      await item.save()
      res.status(201).json(item)
    } catch (error) {
      next(error)
    }
  }

  export const update = async (req, res, next) => {
    try {
      const item = await Waybill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      if (!item) {
        return res.status(404).json({ message: "Waybill not found" })
      }
      res.json(item)
    } catch (error) {
      next(error)
    }
  }

  export const deleteMany = async (req, res, next) => {
    try {
      const { ids } = req.body
      await Waybill.deleteMany({ _id: { $in: ids } })
      res.json({ message: "Waybills deleted successfully" })
    } catch (error) {
      next(error)
    }
  }

export default {getAll, getById, create, update, deleteMany}