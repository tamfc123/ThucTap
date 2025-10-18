import Brand from "../models/Brand.js"

// Get all brands
export const getAllBrands = async (req, res) => {
  try {
    const { page = 1, size = 10, sort = "name", search } = req.query

    const query = {}
    if (search) {
      query.name = { $regex: search, $options: "i" }
    }

    const skip = (page - 1) * size
    const limit = Number.parseInt(size)

    const brands = await Brand.find(query).sort(sort).skip(skip).limit(limit)

    const total = await Brand.countDocuments(query)

    res.json({
      content: brands,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size: limit,
      number: Number.parseInt(page) - 1,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get brand by ID
export const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id)

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" })
    }

    res.json(brand)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create brand
export const createBrand = async (req, res) => {
  try {
    const brand = new Brand(req.body)
    await brand.save()
    res.status(201).json(brand)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Update brand
export const updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" })
    }

    res.json(brand)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Delete brand
export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id)

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" })
    }

    res.json({ message: "Brand deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
export default {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
}