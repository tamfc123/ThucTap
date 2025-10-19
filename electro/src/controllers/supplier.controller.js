import Supplier from "../models/Supplier.js";
import Address from "../models/Address.js";
export const getAll = async (req, res, next) => {
  try {
    const { page = 1, size = 10, sort = "createdAt", search } = req.query;

    // 1. SỬA LỖI SEARCH: Dùng 'displayName'
    const query = search ? { displayName: { $regex: search, $options: "i" } } : {};

    const limit = Number.parseInt(size);
    const skip = (page - 1) * limit;

    const items = await Supplier.find(query)
      .sort(sort)
      .limit(limit) // Sửa lại
      .skip(skip)   // Sửa lại
      // 2. THÊM POPULATE (Giống hệt getSupplierById)
      .populate('address.provinceId', 'name code')
      .populate('address.districtId', 'name code')
      .lean();

    const total = await Supplier.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // 3. SỬA LỖI PHÂN TRANG
    res.json({
      content: items,
      totalElements: total,
      totalPages: totalPages,
      size: limit, // Sửa lại
      page: Number.parseInt(page), // Thêm
      last: page >= totalPages, // Thêm
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const item = await Supplier.findById(req.params.id)
      .populate('address.provinceId', 'name code') // Populate lồng nhau
      .populate('address.districtId', 'name code');
    console.log('Supplier item:', item);
    if (!item) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    // 1. Tạo Supplier trực tiếp từ req.body
    // (Vì req.body đã chứa object 'address' lồng nhau
    // khớp với 'supplierSchema')
    const supplier = await Supplier.create(req.body);

    // 2. Populate (lấy chi tiết) các ID bên trong 'address'
    // (Đã xóa 'ward' theo như bạn phát hiện)
    const populatedSupplier = await Supplier.findById(supplier._id)
      .populate('address.provinceId', 'name code') // Populate lồng nhau
      .populate('address.districtId', 'name code');    // Populate lồng nhau

    res.status(201).json(populatedSupplier);

  } catch (error) {
    // Lỗi E11000 (trùng 'code') mà bạn nói "sửa sau"
    // sẽ bị bắt ở đây
    console.error("--- LỖI createSupplier ---", error);
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const item = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

// Delete supplier
export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id)

    if (!supplier) {
      return res.status(404).json({ message: "supplier not found" })
    }

    res.json({ message: "supplier deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Xuất khẩu tất cả các hàm như một đối tượng
export default {
  getAll,
  getById,
  create,
  update,
  deleteSupplier,
};
