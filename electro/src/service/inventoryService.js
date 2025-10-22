// services/InventoryService.js

import Product from "../models/Product.js";
import Variant from "../models/Variant.js";

/**
 * Tính tổng tồn kho của tất cả các biến thể thuộc một sản phẩm và cập nhật Product.inventory.
 * @param {ObjectId | string} productId - ID của Sản phẩm cần cập nhật
 */
export const updateProductInventory = async (productId) => {
    try {
        // 1. Tìm tất cả các biến thể thuộc sản phẩm này và chỉ lấy trường inventory
        const variants = await Variant.find({ product: productId }).select("inventory");

        // 2. Tính tổng tồn kho
        const totalInventory = variants.reduce((sum, variant) => sum + variant.inventory, 0);

        // 3. Cập nhật tồn kho tổng cho Sản phẩm
        // Sử dụng findByIdAndUpdate để cập nhật và không cần populate/select phức tạp
        await Product.findByIdAndUpdate(
            productId,
            { inventory: totalInventory },
            { new: true } // Trả về tài liệu đã cập nhật (tùy chọn)
        );

        console.log(`Đã cập nhật tồn kho tổng cho Product ${productId}: ${totalInventory}`);
        return totalInventory;
    } catch (error) {
        console.error(`Lỗi khi cập nhật tồn kho sản phẩm ${productId}:`, error);
        // Trong môi trường production, bạn có thể muốn xử lý lỗi nhẹ nhàng hơn
        // Nhưng tạm thời cứ throw để dễ debug
        throw error;
    }
};