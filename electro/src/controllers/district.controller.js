import District from "../models/District.js"

export const getAll = async (req, res, next) => {
  try {
    const { page = 1, size = 10, sort = "name", search, provinceId } = req.query
    const query = {}

    if (search) {
      query.name = { $regex: search, $options: "i" }
    }
    if (provinceId) {
      query.province = provinceId
    }

    const districts = await District.find(query)
      .sort(sort)
      .limit(size * 1)
      .skip((page - 1) * size)
      .populate("province")
      .lean()

    const total = await District.countDocuments(query)

    res.json({
      content: districts,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size: districts.length,
    })
  } catch (error) {
    next(error)
  }
}

export const getById = async (req, res, next) => {
  try {
    const district = await District.findById(req.params.id).populate("province")
    if (!district) {
      return res.status(404).json({ message: "District not found" })
    }
    res.json(district)
  } catch (error) {
    next(error)
  }
}

export const create = async (req, res, next) => {
  try {
    const district = new District(req.body)
    await district.save()
    res.status(201).json(district)
  } catch (error) {
    next(error)
  }
}

export const update = async (req, res, next) => {
  try {
    const district = await District.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!district) {
      return res.status(404).json({ message: "District not found" })
    }
    res.json(district)
  } catch (error) {
    next(error)
  }
}

export const deleteMany = async (req, res, next) => {
  try {
    const { ids } = req.body
    await District.deleteMany({ _id: { $in: ids } })
    res.json({ message: "Districts deleted successfully" })
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