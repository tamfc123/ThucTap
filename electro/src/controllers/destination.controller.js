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
      .populate({
        path: "address",
        populate: [
          { path: "provinceId", model: "Province" },
          { path: "districtId", model: "District" },
          { path: "wardId", model: "Ward" },
        ],
      });

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
    const item = await Destination.findById(req.params.id).populate({
      path: "address",
      populate: [
        { path: "provinceId", model: "Province" },
        { path: "districtId", model: "District" },
        { path: "wardId", model: "Ward" },
      ],
    });

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
    const { contactFullname, contactEmail, contactPhone, address, status } =
      req.body;

    // Tạo Address trước
    const newAddress = new Address(address);
    const savedAddress = await newAddress.save();

    // Gắn addressId vào Destination
    const newDestination = new Destination({
      contactFullname,
      contactEmail,
      contactPhone,
      address: savedAddress._id,
      status,
    });

    const savedDestination = await newDestination.save();

    // Populate lại để trả về đúng cấu trúc
    const populated = await savedDestination.populate({
      path: "address",
      populate: [
        { path: "provinceId", model: "Province" },
        { path: "districtId", model: "District" },
        { path: "wardId", model: "Ward" },
      ],
    });

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
    const { address, ...destinationData } = req.body;

    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    // Nếu có địa chỉ gửi kèm, update luôn
    if (address && destination.address) {
      await Address.findByIdAndUpdate(destination.address, address, {
        new: true,
      });
    }

    // Cập nhật các trường khác
    Object.assign(destination, destinationData);
    const updated = await destination.save();

    const populated = await updated.populate({
      path: "address",
      populate: [
        { path: "provinceId", model: "Province" },
        { path: "districtId", model: "District" },
        { path: "wardId", model: "Ward" },
      ],
    });

    res.json(populated);
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