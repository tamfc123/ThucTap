import Warehouse from "../models/Warehouse.js";

export const getAll = async (req, res, next) => {
  try {
    const { page = 1, size = 10, sort = "createdAt", search } = req.query;
    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    const items = await Warehouse.find(query)
      .sort(sort)
      .limit(size * 1)
      .skip((page - 1) * size)
      .populate("address");

    const total = await Warehouse.countDocuments(query);

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
    const item = await Warehouse.findById(req.params.id).populate("address");
    if (!item) {
      return res.status(404).json({ message: "Warehouse not found" });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const item = new Warehouse(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const item = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ message: "Warehouse not found" });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const deleteMany = async (req, res, next) => {
  try {
    const { ids } = req.body;
    await Warehouse.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Warehouses deleted successfully" });
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
