import Destination from "../models/Destination.js"
import Address from "../models/Address.js"

export const getAll = async (req, res, next) => {
  try {
    const { page = 1, size = 10, sort = "-createdAt", search } = req.query;

    // Tìm theo contactFullname hoặc contactPhone hoặc contactEmail
    const query = search
      ? {
        $or: [
          { contactFullname: { $regex: search, $options: "i" } },
          { contactEmail: { $regex: search, $options: "i" } },
          { contactPhone: { $regex: search, $options: "i" } },
        ],
      }
      : {};

    const total = await Destination.countDocuments(query);

    const items = await Destination.find(query)
      .sort(sort)
      .skip((page - 1) * size)
      .limit(Number(size))
      .populate('address.provinceId', 'name code')
      .populate('address.districtId', 'name code')
      .populate('address.wardId', 'name code')

    res.json({
      content: items,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size: items.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/destinations/:id
 */
export const getById = async (req, res, next) => {
  try {
    const item = await Destination.findById(req.params.id)
      .populate('address.provinceId', 'name code') // Populate lồng nhau
      .populate('address.districtId', 'name code');
    console.log(item);
    if (!item) {
      return res.status(404).json({ message: "Destination not found" });
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/destinations
 */
export const create = async (req, res, next) => {
  try {
    const destination = await Destination.create(req.body);

    const populated = await Destination.findById(destination._id)
      .populate("address.provinceId", "name code")
      .populate("address.districtId", "name code")
      .populate("address.wardId", "name code");

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/destinations/:id
 */
export const update = async (req, res, next) => {
  try {
    const item = await Destination.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ message: "Destination not found" });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    // Nếu có address đi kèm → xóa luôn để tránh orphan data
    if (destination.address) {
      await Address.findByIdAndDelete(destination.address);
    }

    await Destination.findByIdAndDelete(req.params.id);

    res.json({ message: "Destination deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { getAll, getById, create, update, deleteDestination }