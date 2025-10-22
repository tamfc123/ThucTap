import PurchaseOrder from "../models/PurchaseOrder.js";
import mongoose from "mongoose";

// Helper function để biến đổi response (đã bỏ dockets)
const transformPurchaseOrder = (po) => {
    if (!po) return null;

    // Tính toán amount cho từng variant
    const transformedVariants = (po.purchaseOrderVariants || []).map(item => ({
        variant: {
            _id: item.variant?._id,
            product: item.variant?.product ? {
                _id: item.variant.product._id,
                name: item.variant.product.name,
                code: item.variant.product.code,
                slug: item.variant.product.slug,
            } : null,
            sku: item.variant?.sku,
            cost: item.variant?.cost,
            price: item.variant?.price,
            properties: item.variant?.properties, // Cần hàm transform Map -> CollectionWrapper
            status: item.variant?.status,
        },
        // Sửa lại tên field cho khớp UI (nếu UI dùng price) hoặc schema (nếu schema dùng cost)
        // Giả sử UI dùng price:
        cost: item.cost,
        quantity: item.quantity,
        amount: (item.cost || 0) * (item.quantity || 0), // Tính amount dựa trên price
        // Hoặc nếu UI dùng cost và schema dùng cost:
        // cost: item.cost,
        // amount: (item.cost || 0) * (item.quantity || 0),
    }));

    return {
        _id: po._id,
        code: po.code,
        supplier: po.supplier, // <-- Sửa: Trả về nguyên object supplier đã populate
        destination: po.destination, // <-- Sửa: Trả về nguyên object destination đã populate
        purchaseOrderVariants: transformedVariants,
        totalAmount: po.totalAmount,
        note: po.note,
        status: po.status,
        // dockets: [...] // <-- Đã xóa phần này
        createdAt: po.createdAt,
        updatedAt: po.updatedAt,
    };
};


export const getAll = async (req, res, next) => {
    try {
        const { page = 1, size = 10, sort = "-createdAt", search, status } = req.query;
        const query = {};

        if (search) query.code = { $regex: search, $options: "i" };
        if (status) query.status = Number(status);

        const itemsFromDB = await PurchaseOrder.find(query)
            .sort(sort)
            .limit(size * 1)
            .skip((page - 1) * size)
            .populate("supplier", "name displayName")
            .populate({
                path: 'destination',
                populate: [
                    { path: 'address.districtId', select: 'name' },
                    { path: 'address.provinceId', select: 'name' }
                ]
            })
            // === THÊM KHỐI NÀY VÀO GETALL ===
            .populate({
                path: 'purchaseOrderVariants.variant',
                model: 'Variant',
                populate: {
                    path: 'product',
                    model: 'Product',
                    select: 'name code slug'
                }
            })
            .lean();

        const total = await PurchaseOrder.countDocuments(query);
        const transformedItems = itemsFromDB.map(transformPurchaseOrder);

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
        const itemFromDB = await PurchaseOrder.findById(req.params.id)
            .populate("supplier", "name displayName") // Lấy cả name và displayName
            .populate({
                path: 'destination',
                populate: [
                    { path: 'address.districtId', select: 'name' },
                    { path: 'address.provinceId', select: 'name' }
                ]
            })
            // === THÊM KHỐI NÀY VÀO GETALL ===
            .populate({
                path: 'purchaseOrderVariants.variant',
                model: 'Variant',
                populate: {
                    path: 'product',
                    model: 'Product',
                    select: 'name code slug'
                }
            })
            .lean();

        if (!itemFromDB) {
            return res.status(404).json({ message: "PurchaseOrder not found" });
        }
        const transformedItem = transformPurchaseOrder(itemFromDB);
        res.json(transformedItem);
    } catch (error) {
        next(error);
    }
};

export const create = async (req, res, next) => {
    try {
        const code = "PO" + Date.now(); // Tạo code
        const requestData = req.body;

        // Chuyển đổi ID sang ObjectId
        const supplierObjectId = requestData.supplierId ? new mongoose.Types.ObjectId(requestData.supplierId) : null;
        const destinationObjectId = requestData.destinationId ? new mongoose.Types.ObjectId(requestData.destinationId) : null;
        const variantsForDB = (requestData.purchaseOrderVariants || []).map(v => ({
            variant: v.variantId ? new mongoose.Types.ObjectId(v.variantId) : null,
            quantity: v.quantity,
            cost: v.cost,
        }));
        const newItemData = {
            code: code, // Thêm code
            supplier: supplierObjectId,
            destination: destinationObjectId,
            purchaseOrderVariants: variantsForDB,
            totalAmount: requestData.totalAmount,
            note: requestData.note || null,
            status: Number(requestData.status) || 1,
        };

        const item = new PurchaseOrder(newItemData);
        await item.save();
        const populatedItem = await PurchaseOrder.findById(item._id)
            .populate("supplier", "name")
            .populate("destination", "name")
            .populate({
                path: 'purchaseOrderVariants.variant',
                model: 'Variant',
                populate: {
                    path: 'product',
                    model: 'Product',
                    select: 'name code slug'
                }
            })
            .lean();

        res.status(201).json(transformPurchaseOrder(populatedItem));

    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            console.error('❌ Mongoose Validation Error:', JSON.stringify(error.errors, null, 2));
            // Trả về lỗi chi tiết hơn cho frontend (tùy chọn)
            return res.status(400).json({
                message: "Validation failed. Please check your input.",
                errors: error.errors // Gửi chi tiết lỗi validation
            });
        }
        // 2. Bắt lỗi CastError (ID không hợp lệ)
        if (error instanceof mongoose.Error.CastError) {
            console.error('❌ Mongoose Cast Error:', error);
            return res.status(400).json({ message: `Invalid ID format for field: ${error.path}` });
        }
        // 3. Bắt các lỗi khác
        console.error('❌ Error in Create PO:', error);
        next(error); // Chuyển lỗi cho middleware xử lý lỗi chung
    }
};

export const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestData = req.body;

        // 1. Kiểm tra ID có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID đơn hàng không hợp lệ" });
        }

        // 2. Chuyển đổi dữ liệu (tương tự hàm create)
        const variantsForDB = (requestData.purchaseOrderVariants || []).map(v => ({
            variant: v.variantId ? new mongoose.Types.ObjectId(v.variantId) : null,
            quantity: v.quantity,
            cost: v.cost,
        }));

        // 3. Tạo object chứa các trường cần cập nhật
        const updateFields = {
            supplier: requestData.supplierId ? new mongoose.Types.ObjectId(requestData.supplierId) : null,
            destination: requestData.destinationId ? new mongoose.Types.ObjectId(requestData.destinationId) : null,
            purchaseOrderVariants: variantsForDB,
            totalAmount: requestData.totalAmount,
            note: requestData.note || null,
            status: Number(requestData.status),
        };

        // 4. Tìm và cập nhật
        // - { new: false } để nó trả về object cũ (ta không cần, vì ta sẽ populate lại)
        // - { runValidators: true } để đảm bảo dữ liệu mới vẫn qua schema validation
        const item = await PurchaseOrder.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: false, runValidators: true }
        );

        // 5. Kiểm tra xem có tìm thấy để cập nhật không
        if (!item) {
            return res.status(404).json({ message: "PurchaseOrder not found" });
        }

        // 6. Populate lại dữ liệu đã cập nhật để trả về (quan trọng)
        const populatedItem = await PurchaseOrder.findById(id) // Lấy lại bằng ID
            .populate("supplier", "name displayName")
            .populate({
                path: 'destination',
                populate: [
                    { path: 'address.districtId', select: 'name' },
                    { path: 'address.provinceId', select: 'name' }
                ]
            })
            .populate({ // <-- Đừng quên populate cả variants
                path: 'purchaseOrderVariants.variant',
                model: 'Variant',
                populate: {
                    path: 'product',
                    model: 'Product',
                    select: 'name code slug'
                }
            })
            .lean();

        // 7. Trả về dữ liệu đã transform
        res.json(transformPurchaseOrder(populatedItem));

    } catch (error) {
        // 8. Bắt lỗi (tương tự hàm create)
        if (error instanceof mongoose.Error.ValidationError) {
            console.error('❌ Mongoose Validation Error:', JSON.stringify(error.errors, null, 2));
            return res.status(400).json({
                message: "Validation failed. Please check your input.",
                errors: error.errors
            });
        }
        if (error instanceof mongoose.Error.CastError) {
            console.error('❌ Mongoose Cast Error:', error);
            return res.status(400).json({ message: `Invalid ID format for field: ${error.path}` });
            T
        }
        console.error('❌ Error in Update PO:', error);
        next(error);
    }
};
// Delete PurchaseOrder
export const deletePurchaseOrder = async (req, res) => {
    try {
        const purchaseOrder = await PurchaseOrder.findByIdAndDelete(req.params.id)

        if (!purchaseOrder) {
            return res.status(404).json({ message: "PurchaseOrder not found" })
        }

        res.json({ message: "PurchaseOrder deleted successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export default { getAll, getById, create, update, deletePurchaseOrder };