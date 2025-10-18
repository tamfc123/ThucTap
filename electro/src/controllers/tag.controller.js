import Tag from "../models/Tag.js"

export const getAll = async (req, res, next) => {
    try {
      const { page = 1, size = 10, sort = "createdAt", search } = req.query
      const query = search ? { name: { $regex: search, $options: "i" } } : {}

      const items = await Tag.find(query)
        .sort(sort)
        .limit(size * 1)
        .skip((page - 1) * size)

      const total = await Tag.countDocuments(query)

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
      const item = await Tag.findById(req.params.id)
      if (!item) {
        return res.status(404).json({ message: "Tag not found" })
      }
      res.json(item)
    } catch (error) {
      next(error)
    }
  }

  export const create = async (req, res, next) => {
    try {
      const item = new Tag(req.body)
      await item.save()
      res.status(201).json(item)
    } catch (error) {
      next(error)
    }
  }

  export const update = async (req, res, next) => {
    try {
      const item = await Tag.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      if (!item) {
        return res.status(404).json({ message: "Tag not found" })
      }
      res.json(item)
    } catch (error) {
      next(error)
    }
  }

  export const deleteMany = async (req, res, next) => {
    try {
      const { ids } = req.body
      await Tag.deleteMany({ _id: { $in: ids } })
      res.json({ message: "Tags deleted successfully" })
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