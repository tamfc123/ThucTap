import Specification from "../models/Specification.js"

export const getAll = async (req, res, next) => {
  try {
    const { page = 1, size = 10, sort = "createdAt", search } = req.query
    const query = search ? { name: { $regex: search, $options: "i" } } : {}

    const items = await Specification.find(query)
      .sort(sort)
      .limit(size * 1)
      .skip((page - 1) * size)

    const total = await Specification.countDocuments(query)

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
    const item = await Specification.findById(req.params.id)
    if (!item) {
      return res.status(404).json({ message: "Specification not found" })
    }
    res.json(item)
  } catch (error) {
    next(error)
  }
}

export const create = async (req, res, next) => {
  try {
    const item = new Specification(req.body)
    await item.save()
    res.status(201).json(item)
  } catch (error) {
    next(error)
  }
}

export const update = async (req, res, next) => {
  try {
    const item = await Specification.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!item) {
      return res.status(404).json({ message: "Specification not found" })
    }
    res.json(item)
  } catch (error) {
    next(error)
  }
}

// Delete supplier
export const deleteSpecification = async (req, res) => {
  try {
    const supplier = await Specification.findByIdAndDelete(req.params.id)

    if (!supplier) {
      return res.status(404).json({ message: "supplier not found" })
    }

    res.json({ message: "supplier deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}


export default { getAll, getById, create, update, deleteSpecification }