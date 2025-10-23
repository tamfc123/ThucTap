import PaymentMethod from "../models/PaymentMethod.js";

export const getAll = async (req, res, next) => {
  try {
    const { page = 1, size = 10, sort = "createdAt", search } = req.query;
    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    const items = await PaymentMethod.find(query)
      .sort(sort)
      .limit(size * 1)
      .skip((page - 1) * size)
      .lean(); // Thêm .lean() để tăng tốc độ và trả về object JS thuần túy

    const total = await PaymentMethod.countDocuments(query);

    // === THÊM ĐOẠN MAP NÀY ===
    const mappedItems = items.map((item) => ({
      _id: item._id,
      name: item.name,
      code: item.code,
    }));
    // ==========================

    res.json({
      content: mappedItems, // Gửi về 'mappedItems' thay vì 'items'
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size: mappedItems.length, // Dùng 'mappedItems.length'
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const item = await PaymentMethod.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "PaymentMethod not found" });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const item = new PaymentMethod(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const item = await PaymentMethod.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ message: "PaymentMethod not found" });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const deleteMany = async (req, res, next) => {
  try {
    const { ids } = req.body;
    await PaymentMethod.deleteMany({ _id: { $in: ids } });
    res.json({ message: "PaymentMethods deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export default { getAll, getById, create, update, deleteMany };
