import Customer from "../models/Customer.js"

export const getAll = async (req, res, next) => {
    try {
      const { page = 1, size = 10, sort = "createdAt", search } = req.query
      const query = search ? { code: { $regex: search, $options: "i" } } : {}

      const items = await Customer.find(query)
        .sort(sort)
        .limit(size * 1)
        .skip((page - 1) * size)
        .populate("user customerGroup customerStatus customerResource")

      const total = await Customer.countDocuments(query)

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
      const item = await Customer.findById(req.params.id).populate("user customerGroup customerStatus customerResource")
      if (!item) {
        return res.status(404).json({ message: "Customer not found" })
      }
      res.json(item)
    } catch (error) {
      next(error)
    }
  }

  export const create = async (req, res, next) => {
    try {
      const item = new Customer(req.body)
      await item.save()
      res.status(201).json(item)
    } catch (error) {
      next(error)
    }
  }

  export const update = async (req, res, next) => {
    try {
      const item = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      if (!item) {
        return res.status(404).json({ message: "Customer not found" })
      }
      res.json(item)
    } catch (error) {
      next(error)
    }
  }

  export const deleteMany = async (req, res, next) => {
    try {
      const { ids } = req.body
      await Customer.deleteMany({ _id: { $in: ids } })
      res.json({ message: "Customers deleted successfully" })
    } catch (error) {
      next(error)
    }
  }

export default {
  getAll,
  getById,
  create,
  update,
  deleteMany,
}