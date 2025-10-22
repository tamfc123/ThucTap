import Order from "../models/Order.js"
import Product from "../models/Product.js"
import User from "../models/User.js"
// BƯỚC 1: IMPORT THÊM CÁC MODEL CẦN THIẾT
import Waybill from "../models/Waybill.js" // Giả sử bạn có model này
import Supplier from "../models/Supplier.js" // Giả sử bạn có model này
import Brand from "../models/Brand.js" // Giả sử bạn có model này
import Review from "../models/Review.js" // Giả sử bạn có model này

/**
 * Hàm trợ giúp (helper) để lấy thống kê 7 ngày
 * @param {mongoose.Model} model - Mongoose model
 * @param {object} matchFilter - Bộ lọc bổ sung (ví dụ: lọc theo vai trò)
 * @returns {Promise<Array>} - Mảng các đối tượng { date, total }
 */
async function get7DayAggregation(model, matchFilter = {}) {
    // Lấy ngày bắt đầu (7 ngày trước, tính từ 00:00:00)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Chạy Aggregation Pipeline để nhóm theo ngày và đếm
    const results = await model.aggregate([
        { $match: { ...matchFilter, createdAt: { $gte: sevenDaysAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                total: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    // Tạo Map để tra cứu nhanh kết quả
    const statsMap = new Map(results.map(item => [item._id, item.total]));

    // Lấp đầy những ngày bị thiếu (ngày có total = 0)
    const finalStats = [];
    for (let i = 6; i >= 0; i--) {
        const day = new Date();
        day.setDate(day.getDate() - i);
        const dayKey = day.toISOString().split('T')[0];

        finalStats.push({
            date: day,
            total: statsMap.get(dayKey) || 0,
        });
    }

    return finalStats;
}

// Controller chính để lấy tất cả thống kê
export const getDashboardStats = async (req, res, next) => {
    try {
        // Chạy tất cả các truy vấn song song để tăng hiệu suất
        const [
            totalCustomer,
            totalProduct,
            totalOrder,
            totalWaybill,
            totalSupplier,
            totalBrand,
            totalReview,
            statisticRegistration,
            statisticOrder,
            statisticReview,
            statisticWaybill,
        ] = await Promise.all([
            // BƯỚC 2: TÍNH TOÁN CÁC CON SỐ TỔNG QUAN VỚI TÊN ĐÚNG
            User.countDocuments({ role: "USER" }), // Đổi tên totalUsers -> totalCustomer
            Product.countDocuments(),
            Order.countDocuments(),
            Waybill.countDocuments(),
            Supplier.countDocuments(),
            Brand.countDocuments(),
            Review.countDocuments(),

            // BƯỚC 3: TÍNH TOÁN THỐNG KÊ 7 NGÀY
            get7DayAggregation(User, { role: "USER" }),
            get7DayAggregation(Order),
            get7DayAggregation(Review),
            get7DayAggregation(Waybill),
        ]);

        // BƯỚC 4: TRẢ VỀ DỮ LIỆU VỚI CẤU TRÚC MÀ FRONTEND MONG ĐỢI
        res.status(200).json({
            totalCustomer,
            totalProduct,
            totalOrder,
            totalWaybill,
            totalSupplier,
            totalBrand,
            totalReview,
            totalActivePromotion: 0, // Giá trị tạm thời, bạn có thể thêm logic tính toán sau
            statisticRegistration,
            statisticOrder,
            statisticReview,
            statisticWaybill,
        });
    } catch (error) {
        next(error)
    }
}

export default { getDashboardStats }