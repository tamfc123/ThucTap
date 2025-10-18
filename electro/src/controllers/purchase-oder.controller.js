import PurchaseOrder from "../models/PurchaseOrder.js"

export const getAll = async (req, res, next) => {
    try {
      const { page = 1, size = 10, sort = "-createdAt", search, status } = req.query
      const query = {}

      if (search) query.code = { $regex: search, $options: "i" }
      if (status) query.status = status

      const items = await PurchaseOrder.find(query)
        .sort(sort)
        .limit(size * 1)
        .skip((page - 1) * size)
        .populate("supplier warehouse items.variant")

      const total = await PurchaseOrder.countDocuments(query)

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
      const item = await PurchaseOrder.findById(req.params.id).populate("supplier warehouse items.variant")
      if (!item) {
        return res.status(404).json({ message: "PurchaseOrder not found" })
      }
      res.json(item)
    } catch (error) {
      next(error)
    }
  }

  export const create = async (req, res, next) => {
    try {
      const code = "PO" + Date.now()
      const item = new PurchaseOrder({ ...req.body, code })
      await item.save()
      res.status(201).json(item)
    } catch (error) {
      next(error)
    }
  }

  export const update = async (req, res, next) => {
    try {
      const item = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      if (!item) {
        return res.status(404).json({ message: "PurchaseOrder not found" })
      }
      res.json(item)
    } catch (error) {
      next(error)
    }
  }

  export const deleteMany = async (req, res, next) => {
    try {
      const { ids } = req.body
      await PurchaseOrder.deleteMany({ _id: { $in: ids } })
      res.json({ message: "PurchaseOrders deleted successfully" })
    } catch (error) {
      next(error)
    }
  }

export default { getAll, getById, create, update, deleteMany }