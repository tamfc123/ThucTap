import Office from "../models/Office.js";

const createGenericController = (Model) => ({
  getAll: async (req, res, next) => {
    try {
      const { page = 1, size = 10, sort = "createdAt", search } = req.query;
      const query = search ? { name: { $regex: search, $options: "i" } } : {};

      const items = await Model.find(query)
        .sort(sort)
        .limit(size * 1)
        .skip((page - 1) * size);

      const total = await Model.countDocuments(query);

      res.json({
        content: items,
        totalElements: total,
        totalPages: Math.ceil(total / size),
        size: items.length,
      });
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const item = await Model.findById(req.params.id);
      if (!item) return res.status(404).json({ message: `${Model.modelName} not found` });
      res.json(item);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const item = new Model(req.body);
      await item.save();
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!item) return res.status(404).json({ message: `${Model.modelName} not found` });
      res.json(item);
    } catch (error) {
      next(error);
    }
  },

  deleteMany: async (req, res, next) => {
    try {
      const { ids } = req.body;
      await Model.deleteMany({ _id: { $in: ids } });
      res.json({ message: `${Model.modelName}s deleted successfully` });
    } catch (error) {
      next(error);
    }
  },
});

export const officeController = createGenericController(Office);
export default createGenericController;
