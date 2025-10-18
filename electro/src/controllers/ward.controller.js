import Ward from "../models/Ward.js"

export const getAll = async (req, res, next) => {
  try {
    const { page = 1, size = 10, sort = "name", search, districtId } = req.query
    const query = {}

    if (search) {
      query.name = { $regex: search, $options: "i" }
    }
    if (districtId) {
      query.district = districtId
    }

    const wards = await Ward.find(query)
      .sort(sort)
      .limit(size * 1)
      .skip((page - 1) * size)
      .populate("district")

    const total = await Ward.countDocuments(query)

    res.json({
      content: wards,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size: wards.length,
    })
  } catch (error) {
    next(error)
  }
}

export const getById = async (req, res, next) => {
  try {
    const ward = await Ward.findById(req.params.id).populate("district")
    if (!ward) {
      return res.status(404).json({ message: "Ward not found" })
    }
    res.json(ward)
  } catch (error) {
    next(error)
  }
}

export const create = async (req, res, next) => {
  try {
    const ward = new Ward(req.body)
    await ward.save()
    res.status(201).json(ward)
  } catch (error) {
    next(error)
  }
}

export const update = async (req, res, next) => {
  try {
    const ward = await Ward.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!ward) {
      return res.status(404).json({ message: "Ward not found" })
    }
    res.json(ward)
  } catch (error) {
    next(error)
  }
}

export const deleteMany = async (req, res, next) => {
  try {
    const { ids } = req.body
    await Ward.deleteMany({ _id: { $in: ids } })
    res.json({ message: "Wards deleted successfully" })
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