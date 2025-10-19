import Province from "../models/Province.js"
import router from "../routes/order.routes.js"

export const getAll = async (req, res, next) => {
  try {
    const { page = 1, size = 10, sort = "name", search, all } = req.query

    const query = search ? { name: { $regex: search, $options: "i" } } : {}

    let provinces, total

    if (all && Number(all) === 1) {
      // ✅ Khi FE truyền all=1 -> lấy toàn bộ dữ liệu, không phân trang
      provinces = await Province.find(query).sort(sort)
      total = provinces.length
    } else {
      // ✅ Phân trang bình thường
      provinces = await Province.find(query)
        .sort(sort)
        .skip((page - 1) * size)
        .limit(Number(size))
        .lean()
      total = await Province.countDocuments(query)
    }

    res.json({
      content: provinces,
      totalElements: total,
      totalPages: all ? 1 : Math.ceil(total / size),
      size: provinces.length,
    })
  } catch (error) {
    next(error)
  }
}

export const getById = async (req, res, next) => {
  try {
    const province = await Province.findById(req.params.id)
    if (!province) {
      return res.status(404).json({ message: "Province not found" })
    }
    res.json(province)
  } catch (error) {
    next(error)
  }
}

export const create = async (req, res, next) => {
  try {
    const province = new Province(req.body)
    await province.save()
    res.status(201).json(province)
  } catch (error) {
    next(error)
  }
}

export const update = async (req, res, next) => {
  try {
    const province = await Province.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!province) {
      return res.status(404).json({ message: "Province not found" })
    }
    res.json(province)
  } catch (error) {
    next(error)
  }
}

export const deleteMany = async (req, res, next) => {
  try {
    const { ids } = req.body
    await Province.deleteMany({ _id: { $in: ids } })
    res.json({ message: "Provinces deleted successfully" })
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