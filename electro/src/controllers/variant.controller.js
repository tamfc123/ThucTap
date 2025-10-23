import Variant from "../models/Variant.js";
import mongoose from "mongoose"; // Đảm bảo đã import mongoose

// =======================================================
// HELPER 1: Biến đổi Request (Frontend CollectionWrapper) -> Map (DB)
// (Copy hàm này từ controller Product hoặc tạo file helper riêng)
// =======================================================
const transformCollectionToMap_Request = (collection) => {
    if (!collection || !collection.content || collection.content.length === 0) {
        return new Map();
    }
    const newMap = new Map();
    for (const item of collection.content) {
        newMap.set(item.code, item.value); // Giả sử item có code và value
    }
    return newMap;
};

// =======================================================
// HELPER 2: Biến đổi Response (DB Object) -> CollectionWrapper (Frontend)
// (Copy hàm này từ controller Product hoặc tạo file helper riêng)
// =======================================================
const transformMapToCollection_Response = (mapData) => {
    if (!mapData || Object.keys(mapData).length === 0) {
        return { content: [] };
    }
    const content = [];
    for (const [key, value] of Object.entries(mapData)) {
        // Cần đảm bảo có id và name nếu frontend cần
        content.push({
            id: key, // Dùng key làm id tạm thời
            code: key,
            name: key, // Dùng key làm name tạm thời
            value: value,
        });
    }
    return { content: content };
};

// =======================================================
// HÀM BIẾN ĐỔI RESPONSE CHO VARIANT
// =======================================================
const transformVariantResponse = (variant) => {
    if (!variant) return null;
    return {
        ...variant,
        // Chỉ giữ các trường cần thiết của product
        product: variant.product ? { 
            _id: variant.product._id,
            name: variant.product.name,
            code: variant.product.code,
            slug: variant.product.slug,
        } : null,
        // Biến đổi properties
        properties: transformMapToCollection_Response(variant.properties),
        // Thêm id (giống _id) nếu frontend cần
        id: variant._id, 
    };
};

// =======================================================
// CONTROLLER FUNCTIONS ĐÃ SỬA
// =======================================================

export const getAll = async (req, res, next) => {
    try {
        const { page = 1, size = 10, sort = "createdAt", search, productId } = req.query;
        const query = {};

        if (search) query.sku = { $regex: search, $options: "i" };
        if (productId) query.product = productId; // Giữ nguyên, productId là ObjectId

        const itemsFromDB = await Variant.find(query)
            .sort(sort)
            .limit(size * 1)
            .skip((page - 1) * size)
            // Sửa populate product và thêm lean
            .populate("product", "name code slug") 
            .lean(); 

        const total = await Variant.countDocuments(query);

        // Biến đổi dữ liệu trước khi gửi
        const transformedItems = itemsFromDB.map(transformVariantResponse);
        console.log("Transformed Items:", transformedItems); // Debug log

        res.json({
            content: transformedItems,
            totalElements: total,
            totalPages: Math.ceil(total / size),
            size: itemsFromDB.length, 
        });
    } catch (error) {
        next(error);
    }
};

export const getById = async (req, res, next) => {
    try {
        const itemFromDB = await Variant.findById(req.params.id)
            // Sửa populate product và thêm lean
            .populate("product", "name code slug") 
            .lean(); 

        if (!itemFromDB) {
            return res.status(404).json({ message: "Variant not found" });
        }

        // Biến đổi dữ liệu
        const transformedItem = transformVariantResponse(itemFromDB);

        res.json(transformedItem);
    } catch (error) {
        next(error);
    }
};

export const create = async (req, res, next) => {
    try {
        const requestData = { ...req.body };

        // Biến đổi properties từ CollectionWrapper sang Map
        if (requestData.properties) {
            requestData.properties = transformCollectionToMap_Request(requestData.properties);
        }
         // Chuyển đổi product ID sang ObjectId (nếu frontend gửi string)
        if (requestData.product && typeof requestData.product === 'string') {
            requestData.product = new mongoose.Types.ObjectId(requestData.product);
        }

        const item = new Variant(requestData);
        await item.save();

        // Populate lại để trả về đúng chuẩn (tùy chọn)
         const populatedItem = await Variant.findById(item._id)
            .populate("product", "name code slug")
            .lean();

        res.status(201).json(transformVariantResponse(populatedItem)); // Trả về đã biến đổi
    } catch (error) {
         if (error instanceof mongoose.Error.CastError) {
             return res.status(400).json({ message: "Invalid ID format for product." });
        }
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const updateData = { ...req.body };

        // Biến đổi properties từ CollectionWrapper sang Map nếu có
        if (updateData.properties) {
            updateData.properties = transformCollectionToMap_Request(updateData.properties);
        }
         // Chuyển đổi product ID sang ObjectId nếu có
        if (updateData.product && typeof updateData.product === 'string') {
            updateData.product = new mongoose.Types.ObjectId(updateData.product);
        }

        const item = await Variant.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
            // Populate lại để trả về đúng chuẩn
            .populate("product", "name code slug")
            .lean();

        if (!item) {
            return res.status(404).json({ message: "Variant not found" });
        }
        res.json(transformVariantResponse(item)); // Trả về đã biến đổi
    } catch (error) {
         if (error instanceof mongoose.Error.CastError) {
             return res.status(400).json({ message: "Invalid ID format for product." });
        }
        next(error);
    }
};

// deleteMany không cần thay đổi đáng kể, chỉ cần đảm bảo ids là string ObjectId
export const deleteMany = async (req, res, next) => {
    try {
        const { ids } = req.body; // Giả sử ids là mảng string ObjectId
         const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
        await Variant.deleteMany({ _id: { $in: objectIds } });
        res.json({ message: "Variants deleted successfully" });
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
             return res.status(400).json({ message: "Invalid ID format provided in the list." });
        }
        next(error);
    }
};

export default { getAll, getById, create, update, deleteMany };