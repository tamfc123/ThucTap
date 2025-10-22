import Warehouse from "../models/Warehouse.js";
import Address from "../models/Address.js";
export const getAll = async (req, res, next) => {
  try {
    const { page = 1, size = 10, sort = "-createdAt", search } = req.query;
    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    const items = await Warehouse.find(query)
      .sort(sort)
      .skip((page - 1) * size)
      .limit(Number(size))
      .populate('address.provinceId', 'name code')
      .populate('address.districtId', 'name code')
      .populate('address.wardId', 'name code');

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
    const item = await Warehouse.findById(req.params.id)
      .populate('address.provinceId', 'name code')
      .populate('address.districtId', 'name code')
      .populate('address.wardId', 'name code');

    if (!item) return res.status(404).json({ message: "Warehouse not found" });

    res.json(item);
  } catch (error) {
    next(error);
  }
};


export const create = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.create(req.body);

    const populated = await Warehouse.findById(warehouse._id)
      .populate('address.provinceId', 'name code')
      .populate('address.districtId', 'name code')
      .populate('address.wardId', 'name code');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};


export const update = async (req, res, next) => {
  try {
    const item = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('address.provinceId', 'name code')
      .populate('address.districtId', 'name code')
      .populate('address.wardId', 'name code');

    if (!item) return res.status(404).json({ message: "Warehouse not found" });

    res.json(item);
  } catch (error) {
    next(error);
  }
};


export const deleteById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedWarehouse = await Warehouse.findByIdAndDelete(id);

    if (!deletedWarehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    res.json({ message: "Warehouse deleted successfully" });
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
  deleteById,
};
