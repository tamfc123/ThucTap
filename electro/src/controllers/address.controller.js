import Address from "../models/Address.js"

export const getAll = async (req, res, next) => {
  try {
    const { page = 1, size = 10, sort = "createdAt", search } = req.query
    const query = search ? { $text: { $search: search } } : {}

    const addresses = await Address.find(query)
      .sort(sort)
      .limit(size * 1)
      .skip((page - 1) * size)
      .populate("province district ward")

    const total = await Address.countDocuments(query)

    res.json({
      content: addresses,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size: addresses.length,
    })
  } catch (error) {
    next(error)
  }
}

export const getById = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id).populate("province district ward")
    if (!address) {
      return res.status(404).json({ message: "Address not found" })
    }
    res.json(address)
  } catch (error) {
    next(error)
  }
}

export const create = async (req, res, next) => {
  try {
    const address = new Address(req.body)
    await address.save()
    res.status(201).json(address)
  } catch (error) {
    next(error)
  }
}

export const update = async (req, res, next) => {
  try {
    const address = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!address) {
      return res.status(404).json({ message: "Address not found" })
    }
    res.json(address)
  } catch (error) {
    next(error)
  }
}

export const deleteMany = async (req, res, next) => {
  try {
    const { ids } = req.body
    await Address.deleteMany({ _id: { $in: ids } })
    res.json({ message: "Addresses deleted successfully" })
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
