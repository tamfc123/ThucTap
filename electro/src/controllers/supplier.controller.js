import Supplier from "../models/Supplier.js";

export const getAll = async (req, res, next) => {
  try {
    const { page = 1, size = 10, sort = "createdAt", search } = req.query;
    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    const items = await Supplier.find(query)
      .sort(sort)
      .limit(size * 1)
      .skip((page - 1) * size);

    const total = await Supplier.countDocuments(query);

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

export const getById = async (req, res, next) => {
  try {
    const item = await Supplier.findById(req.params.id);
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
    console.log("📦 Supplier body:", req.body); 
    req.body.name = req.body.companyName || req.body.displayName;
    req.body.address = req.body.address?.line; // vì schema hiện tại yêu cầu string, không phải object

    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
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

export const deleteMany = async (req, res, next) => {
  try {
    const { ids } = req.body;
    await Supplier.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Suppliers deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Xuất khẩu tất cả các hàm như một đối tượng
export default {
  getAll,
  getById,
  create,
  update,
  deleteMany,
};
