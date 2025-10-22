import Warehouse from "../models/Warehouse.js";
import Address from "../models/Address.js";
import mongoose from 'mongoose';


export const getAll = async (req, res, next) => {
  try {
    const { page = 1, size = 10, sort = "createdAt", search } = req.query;
    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    const items = await Warehouse.find(query)
      .sort(sort)
      .limit(size * 1)
      .skip((page - 1) * size)
      .populate({
        path: "address",
        populate: [
          { path: "province", select: "name" },
          { path: "district", select: "name" },
          { path: "ward", select: "name" },
        ],
      });

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
    .populate({
        path: "address",
        populate: [
          { path: "province", select: "name" },
          { path: "district", select: "name" },
          { path: "ward", select: "name" },
        ],
      });
    if (!item) {
      return res.status(404).json({ message: "Warehouse not found" });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

// export const create = async (req, res, next) => {
//   try {
//     const item = new Warehouse(req.body);
//     await item.save();
//     res.status(201).json(item);
//   } catch (error) {
//     next(error);
//   }
// };

export const create = async (req, res, next) => {
  try {
    let addressId = null;

    // Nếu FE gửi lên address là object chi tiết
    if (req.body.address && typeof req.body.address === "object") {
      const { line, provinceId, districtId, wardId } = req.body.address;

      // Tạo document Address mới
      const newAddress = new Address({
        line,
        province: provinceId,
        district: districtId,
        ward: wardId,
      });

      const savedAddress = await newAddress.save();
      addressId = savedAddress._id;
    } else {
      // Trường hợp FE chỉ gửi ObjectId sẵn có
      addressId = req.body.address;
    }

    // Tạo warehouse, gắn addressId
    const warehouse = new Warehouse({
      name: req.body.name,
      code: req.body.code,
      address: addressId,
      status: req.body.status,
    });

    const savedWarehouse = await warehouse.save();

    // Populate để trả về thông tin address đầy đủ
    const populatedWarehouse = await savedWarehouse.populate("address");

    res.status(201).json(populatedWarehouse);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { address, ...warehouseData } = req.body;

    let addressId = null;
    if (address && Object.keys(address).length > 0) {
      const addressDoc = await Address.create({
        line: address.line,
        province: address.provinceId,
        district: address.districtId,
        ward: address.wardId,
      });
      addressId = addressDoc._id;
    }

    const updatedWarehouse = await Warehouse.findByIdAndUpdate(
      req.params.id,
      {
        ...warehouseData,
        address: addressId || null,
      },
      { new: true, runValidators: true }
    ).populate("address");

    if (!updatedWarehouse)
      return res.status(404).json({ message: "Warehouse not found" });

    res.json(updatedWarehouse);
  } catch (error) {
    next(error);
  }
};

export const deleteMany = async (req, res, next) => {
  try {
    const { ids } = req.body;

    // Kiểm tra đầu vào
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Danh sách ID không hợp lệ.' });
    }

    // Kiểm tra các id có hợp lệ không
    const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        message: `Các ID không hợp lệ: ${invalidIds.join(', ')}`
      });
    }

    // Thực hiện xóa
    const result = await Warehouse.deleteMany({ _id: { $in: ids } });

    res.json({
      message: 'Xóa kho thành công.',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};

// xóa theo id
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
  deleteMany,
  deleteById,
};
