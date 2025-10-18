// Tên file: seed.js
import mongoose from "mongoose";

// 1. IMPORT CÁC MODELS
import Province from "./src/models/Province.js"; 
import District from "./src/models/District.js";
import Ward from "./src/models/Ward.js";       

// 2. IMPORT DỮ LIỆU TỪ FILE JSON
// (Giả sử bạn đã đổi tên chúng thành .json và đặt ở thư mục 'data')
import tinhTpData from "./src/models/data/tinh_tp.json" with { type: "json" };
import quanHuyenData from "./src/models/data/quan_huyen.json" with { type: "json" };
import xaPhuongData from "./src/models/data/xa_phuong.json" with { type: "json" };

// 3. THAY THẾ BẰNG CHUỖI KẾT NỐI MONGODB CỦA BẠN
const MONGO_URI = "mongodb+srv://electro_db:Huy123%40@cluster0.uobqiic.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const seedDatabase = async () => {
  try {
    // 4. KẾT NỐI DATABASE
    await mongoose.connect(MONGO_URI);
    console.log("Database connected successfully.");

    // 5. XÓA DỮ LIỆU CŨ (để tránh trùng lặp)
    console.log("Deleting old data...");
    await Ward.deleteMany({});
    await District.deleteMany({});
    await Province.deleteMany({});
    console.log("Old data deleted.");

    // === BƯỚC 1: INSERT PROVINCE ===
    console.log("Seeding Provinces...");
    // Chuyển object { "01": {...} } thành array [ {...}, {...} ]
    const provincesToInsert = Object.values(tinhTpData).map(p => ({
      name: p.name,
      code: p.code,
    }));
    // Insert vào DB
    const createdProvinces = await Province.insertMany(provincesToInsert);
    
    // Tạo bản đồ tra cứu: Map<province_code, province_id>
    const provinceMap = new Map();
    createdProvinces.forEach(p => {
      provinceMap.set(p.code, p._id); // p._id là ObjectId
    });
    console.log(`Seeded ${createdProvinces.length} provinces.`);

    // === BƯỚC 2: INSERT DISTRICT ===
    console.log("Seeding Districts...");
    // Chuyển object thành array và map với province_id
    const districtsToInsert = Object.values(quanHuyenData)
      .map(d => {
        const provinceId = provinceMap.get(d.parent_code); // Tra cứu _id
        if (!provinceId) {
          console.warn(`WARN: Province code ${d.parent_code} not found for district ${d.name}`);
          return null; // Bỏ qua nếu không tìm thấy tỉnh
        }
        return {
          name: d.name_with_type,
          code: d.code,
          province: provinceId, // Gán ObjectId
        };
      })
      .filter(Boolean); // Lọc bỏ các giá trị null (nếu có)

    const createdDistricts = await District.insertMany(districtsToInsert);

    // Tạo bản đồ tra cứu: Map<district_code, district_id>
    const districtMap = new Map();
    createdDistricts.forEach(d => {
      districtMap.set(d.code, d._id);
    });
    console.log(`Seeded ${createdDistricts.length} districts.`);

    // === BƯỚC 3: INSERT WARD ===
    console.log("Seeding Wards...");
    const wardsToInsert = Object.values(xaPhuongData)
      .map(w => {
        const districtId = districtMap.get(w.parent_code); // Tra cứu _id
        if (!districtId) {
          console.warn(`WARN: District code ${w.parent_code} not found for ward ${w.name}`);
          return null;
        }
        return {
          name: w.name_with_type,
          code: w.code,
          district: districtId, // Gán ObjectId
        };
      })
      .filter(Boolean);
    
    const createdWards = await Ward.insertMany(wardsToInsert);
    console.log(`Seeded ${createdWards.length} wards.`);

    // === HOÀN TẤT ===
    console.log("SEEDING COMPLETED SUCCESSFULLY!");

  } catch (error) {
    console.error("ERROR SEEDING DATABASE:", error);
  } finally {
    // 6. ĐÓNG KẾT NỐI
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

// Chạy script
seedDatabase();