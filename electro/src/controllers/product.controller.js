import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";
import Variant from "../models/Variant.js";
import Tag from "../models/Tag.js";
import Guarantee from "../models/Guarantee.js";
import Supplier from "../models/Supplier.js";
import Unit from "../models/Unit.js";

// =======================================================
// HELPER 1: Biến đổi Request (Frontend CollectionWrapper) -> Map (DB)
// (Hàm này đã đúng)
// =======================================================
const transformCollectionToMap_Request = (collection) => {
  if (!collection || !collection.content || collection.content.length === 0) {
    return new Map();
  }
  const newMap = new Map();
  for (const item of collection.content) {
    // item.code là key (ví dụ: 'color', 'cpu')
    // item.value là giá trị (ví dụ: ['đen', 'trắng'] hoặc 'core i7')
    newMap.set(item.code, item.value);
  }
  return newMap;
};

// =======================================================
// HELPER 2: Biến đổi Response (DB Object) -> CollectionWrapper (Frontend)
// (SỬA LẠI: Hàm này dùng cho response, nên nó nhận Object từ .lean())
// =======================================================
const transformMapToCollection_Response = (mapData) => {
  // mapData là một Object (từ .lean())
  if (!mapData || Object.keys(mapData).length === 0) {
    // Trả về cấu trúc rỗng mà frontend mong đợi
    return { content: [] };
  }
  const content = [];
  for (const [key, value] of Object.entries(mapData)) {
    content.push({
      code: key,
      // (TODO: Bạn có thể cần 1 bảng tra cứu để lấy 'name' đầy đủ)
      name: key, // Tạm thời dùng name = code
      value: value,
    });
  }
  return { content: content };
};

// =======================================================
// HÀM BIẾN ĐỔI RESPONSE (SỬA LẠI)
// (Dùng chung cho tất cả API trả về Product)
// =======================================================
const transformProductResponse = (productObject) => {
  // === SỬA ===
  // Bỏ .toObject() và Object.fromEntries() vì chúng ta sẽ dùng .lean() ở MỌI NƠI.
  // productObject giờ luôn là một Plain Old JavaScript Object (POJO).

  return {
    ...productObject,

    // Sử dụng Helper 2 để biến đổi NGƯỢC LẠI cho frontend
    specifications: transformMapToCollection_Response(productObject.specifications),
    properties: transformMapToCollection_Response(productObject.properties),

    // Đảm bảo các mảng luôn tồn tại
    images: productObject.images || [],
    tags: productObject.tags || [],
    variants: (productObject.variants || []).map(variant => ({
      ...variant,
      // Biến đổi luôn properties BÊN TRONG variant
      properties: transformMapToCollection_Response(variant.properties)
    })),
  };
};

// =======================================================
// API 1: Get all products (SỬA LỌC GIÁ)
// =======================================================
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1, size = 10, sort = "-createdAt",
      search, categoryId, brandId, supplierId, unitId, guaranteeId,
      minPrice, maxPrice, status,
    } = req.query;

    const query = {};
    if (search) { query.name = { $regex: search, $options: "i" } }
    if (categoryId) { query.categoryId = categoryId }
    if (brandId) { query.brandId = brandId }
    if (supplierId) { query.supplierId = supplierId }
    if (unitId) { query.unitId = unitId }
    if (guaranteeId) { query.guaranteeId = guaranteeId }
    if (status) { query.status = status }

    // === SỬA LẠI LOGIC LỌC GIÁ ===
    if (minPrice || maxPrice) {
      // Tìm các sản phẩm có ÍT NHẤT MỘT variant thỏa mãn
      query.variants = {
        $elemMatch: {
          price: {}
        }
      };
      if (minPrice) {
        query.variants.$elemMatch.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        query.variants.$elemMatch.price.$lte = Number(maxPrice);
      }
    }
    // === KẾT THÚC SỬA ===

    const limit = Number.parseInt(size) || 10;
    const skip = (page - 1) * limit;

    const productsFromDB = await Product.find(query)
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug")
      .populate("variants")
      .populate("supplierId", "displayName")
      .populate("unitId", "name")
      .populate("tags", "name slug")
      .populate("guaranteeId", "name")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(); // (Đã có .lean() - Tốt!)

    // Đếm tổng số document khớp với query
    // LƯU Ý: Nếu dùng $elemMatch, countDocuments có thể cần điều chỉnh
    // nhưng trong trường hợp này nó vẫn đếm đúng số *sản phẩm*
    const total = await Product.countDocuments(query);

    // Dùng hàm transform đã sửa
    const products = productsFromDB.map(transformProductResponse);

    res.json({
      content: products,
      totalElements: total,
      totalPages: Math.ceil(total / limit),
      size: limit,
      number: Number.parseInt(page) - 1,
    });
  } catch (error) {
    console.error("--- LỖI getAllProducts ---", error);
    res.status(500).json({ message: error.message });
  }
}

// =======================================================
// API 2: Get product by ID (SỬA LẠI - THÊM .lean())
// =======================================================
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug")
      .populate("supplierId", "displayName")
      .populate("unitId", "name")
      .populate("guaranteeId", "name")
      .populate("variants")
      .populate("tags", "name slug")
      .lean(); // <-- THÊM .lean() ĐỂ TIÊU CHUẨN HÓA

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Dùng hàm transform đã sửa
    const responseData = transformProductResponse(product);
    res.json(responseData);

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =======================================================
// API 3: Get product by slug (SỬA LẠI - THÊM .lean())
// =======================================================
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug")
      .populate("supplierId", "displayName")
      .populate("unitId", "name")
      .populate("guaranteeId", "name")
      .populate("variants")
      .populate("tags", "name slug")
      .lean(); // <-- THÊM .lean() ĐỂ TIÊU CHUẨN HÓA

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Dùng hàm transform đã sửa
    const responseData = transformProductResponse(product);
    res.json(responseData);

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =======================================================
// (HELPER CHO API 4 & 5) Xử lý Tags
// =======================================================
const getTagIds = async (tags) => {
  if (!tags || tags.length === 0) return [];

  const tagIds = await Promise.all(
    tags.map(async (tagObject) => {
      // Nếu tag gửi lên đã có ID (nghĩa là tag đã tồn tại)
      if (tagObject.id || tagObject._id) return tagObject.id || tagObject._id;

      // Nếu là tag mới (chỉ có 'name'), tìm hoặc tạo mới
      let foundTag = await Tag.findOne({ name: tagObject.name });
      if (!foundTag) {
        foundTag = await Tag.create(tagObject);
      }
      return foundTag._id;
    })
  );
  return tagIds;
}

// =======================================================
// API 4: Create product (SỬA LẠI LOGIC TẠO VARIANT)
// =======================================================
const createProduct = async (req, res) => {
  try {
    // 1. Tách
    const { variants, tags, specifications, properties, ...productData } = req.body;

    // 2. Biến đổi Maps (Dùng HELPER 1)
    productData.specifications = transformCollectionToMap_Request(specifications);
    productData.properties = transformCollectionToMap_Request(properties);

    // 3. Tạo Cha (lần 1)
    const newProduct = new Product(productData);
    await newProduct.save();

    // 4. Xử lý Variants (SỬA LOGIC)
    const variantIds = [];
    if (variants && variants.length > 0) {
      const createdVariants = await Promise.all(
        variants.map(async (variantObject) => {
          variantObject.product = newProduct._id;

          // === SỬA ===
          // Mỗi variant CŨNG có 'properties' cần biến đổi
          // Đây là lỗi Zod ban đầu của bạn
          variantObject.properties = transformCollectionToMap_Request(variantObject.properties);
          // ===========

          const newVariant = new Variant(variantObject);
          await newVariant.save();
          return newVariant._id;
        })
      );
      variantIds.push(...createdVariants);
    }

    // 5. Xử lý Tags (Dùng helper)
    const tagIds = await getTagIds(tags);

    // 6. Cập nhật Cha (lần 2)
    newProduct.variants = variantIds;
    newProduct.tags = tagIds;
    const savedProduct = await newProduct.save();

    // 7. Populate (THÊM .lean())
    const populatedProduct = await Product.findById(savedProduct._id)
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug")
      .populate("supplierId", "displayName")
      .populate("unitId", "name")
      .populate("guaranteeId", "name")
      .populate("variants")
      .populate("tags", "name slug")
      .lean(); // <-- THÊM .lean()

    // 8. Biến đổi Response (Dùng Helper 3)
    const responseData = transformProductResponse(populatedProduct);
    res.status(201).json(responseData);

  } catch (error) {
    console.error("--- LỖI createProduct ---", error);
    res.status(400).json({ message: error.message });
  }
};

// =======================================================
// API 5: Update product (VIẾT LẠI HOÀN TOÀN HÀM NÀY)
// =======================================================
const updateProduct = async (req, res) => {
  try {
    const { variants, tags, specifications, properties, ...productData } = req.body;

    // 1. Biến đổi Maps (Dùng HELPER 1)
    productData.specifications = transformCollectionToMap_Request(specifications);
    productData.properties = transformCollectionToMap_Request(properties);

    // 2. Xử lý Tags (Dùng helper)
    productData.tags = await getTagIds(tags);

    // 3. Xử lý Variants (Logic phức tạp)
    const variantIds = [];
    if (variants && variants.length > 0) {
      const updatedVariantIds = await Promise.all(
        variants.map(async (variantObject) => {
          // Biến đổi properties BÊN TRONG variant
          variantObject.properties = transformCollectionToMap_Request(variantObject.properties);

          if (variantObject._id) {
            // Variant đã tồn tại -> Cập nhật
            const updatedVariant = await Variant.findByIdAndUpdate(
              variantObject._id,
              variantObject,
              { new: true }
            );
            return updatedVariant._id;
          } else {
            // Variant mới -> Tạo mới
            variantObject.product = req.params.id; // Gán ID sản phẩm cha
            const newVariant = new Variant(variantObject);
            await newVariant.save();
            return newVariant._id;
          }
        })
      );
      variantIds.push(...updatedVariantIds);
    }

    // 4. Xóa các variant cũ không còn được gửi lên
    await Variant.deleteMany({
      product: req.params.id,      // Xóa variant của sản phẩm này
      _id: { $nin: variantIds }     // Mà ID không nằm trong danh sách mới
    });

    // 5. Gán mảng ID variant mới vào productData
    productData.variants = variantIds;

    // 6. Cập nhật Product cha
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      productData, // Gồm { ...productData, specifications, properties, tags, variants }
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" })
    }

    // 7. Populate (THÊM .lean())
    const populatedProduct = await Product.findById(updatedProduct._id)
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug")
      .populate("supplierId", "displayName")
      .populate("unitId", "name")
      .populate("guaranteeId", "name")
      .populate("variants")
      .populate("tags", "name slug")
      .lean(); // <-- THÊM .lean()

    // 8. Biến đổi Response
    const responseData = transformProductResponse(populatedProduct);
    res.json(responseData);

  } catch (error) {
    console.error("--- LỖI updateProduct ---", error);
    res.status(400).json({ message: error.message });
  }
}

// =======================================================
// API 6: Delete product (Hàm này đã đúng)
// =======================================================
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Xóa các variant con mồ côi
    await Variant.deleteMany({ product: product._id });

    res.json({ message: "Product deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =======================================================
// EXPORT
// =======================================================
export default {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
}