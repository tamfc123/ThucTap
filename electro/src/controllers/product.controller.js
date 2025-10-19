import Product from "../models/Product.js"
import Category from "../models/Category.js"
import Brand from "../models/Brand.js"
import Variant from "../models/Variant.js"
import Tag from "../models/Tag.js"
// Hàm helper để biến đổi Map (từ DB) thành CollectionWrapper (cho Frontend)
const transformMapToCollection = (mapData) => {
  // 'mapData' là một Object (vì .lean()), không phải Map

  // SỬA DÒNG KIỂM TRA NÀY
  if (!mapData || Object.keys(mapData).length === 0) {
    return null;
  }
  const content = [];

  // SỬA DÒNG LẶP NÀY (Dùng Object.entries)
  for (const [key, value] of Object.entries(mapData)) {
    content.push({
      code: key, // 'code' là key (vd: "cpu")
      name: key, // (Tạm thời dùng 'name' = 'code')
      value: value, // 'value' là value (vd: "i7" hoặc ["Red", "Blue"])
    });
  }
  return { content: content };
};

// Get all products with filters
export const getAllProducts = async (req, res) => {
  try {

    // Khối code query gốc của bạn
    const {
      page = 1,
      size = 10,
      sort = "-createdAt",
      search,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      status,
    } = req.query
    const query = {}
    if (search) { query.name = { $regex: search, $options: "i" } }
    if (categoryId) { query.category = categoryId }
    if (brandId) { query.brand = brandId }
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }
    if (status) { query.status = status }

    const limit = Number.parseInt(size) || 10;
    const skip = (page - 1) * limit;

    // Truy vấn và Populate
    const productsFromDB = await Product.find(query)
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .populate("variants")
      .populate("supplier", "displayName")
      .populate("unit", "name")
      .populate("tags", "name slug")
      .populate("guarantee", "name")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(); // .lean() Gây ra lỗi (đã sửa ở helper)

    const total = await Product.countDocuments(query);

    // Biến đổi (Dùng helper đã sửa)
    const products = productsFromDB.map(product => {
      return {
        ...product,
        specifications: transformMapToCollection(product.specifications),
        properties: transformMapToCollection(product.properties),
        images: product.images || [],
        tags: product.tags || [],
        variants: product.variants || [],
      };
    });

    // Trả về JSON
    res.json({
      content: products,
      totalElements: total,
      totalPages: Math.ceil(total / limit),
      size: limit,
      number: Number.parseInt(page) - 1,
    });
  } catch (error) {
    console.error("--- LỖI getAllProducts ---", error); // Thêm log này
    res.status(500).json({ message: error.message });
  }
}

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .populate("variants")
      .populate("specifications")
      .populate("properties")
    console.log('Product item:', product)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get product by slug
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .populate("variants")
      .populate("specifications")
      .populate("properties")

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * Hàm helper để biến đổi CollectionWrapper ({ content: [...] })
 * thành Map (dạng object { key: value })
 */
const transformCollectionToMap = (collection) => {
  // Nếu không có, trả về Map rỗng (hoặc object rỗng {})
  if (!collection || !collection.content || collection.content.length === 0) {
    return new Map();
  }

  const newMap = new Map();
  for (const item of collection.content) {
    // Gán key (item.code) = value (item.value)
    newMap.set(item.code, item.value);
  }
  // VD: newMap sẽ là { "cpu": "Core i7", "ram": "16GB" }
  return newMap;
};

// Create product
export const createProduct = async (req, res) => {
  try {
    // 1. TÁCH CẢ 4 TRƯỜNG RA
    const { variants, tags, specifications, properties, ...productData } = req.body;

    // 2. TẠO PRODUCT (CHA) (Chỉ với dữ liệu đơn giản)
    const newProduct = new Product(productData);
    await newProduct.save(); // Lưu để lấy _id

    // 3. XỬ LÝ VARIANTS (CON) (Code của bạn đã đúng)
    const variantIds = [];
    if (variants && variants.length > 0) {
      const createdVariants = await Promise.all(
        variants.map(async (variantObject) => {
          variantObject.product = newProduct._id;
          const newVariant = new Variant(variantObject);
          await newVariant.save();
          return newVariant._id;
        })
      );
      variantIds.push(...createdVariants);
    }

    // 4. XỬ LÝ TAGS (CON)
    const tagIds = [];
    if (tags && tags.length > 0) {
      const createdTags = await Promise.all(
        tags.map(async (tagObject) => {
          // Logic: Tìm tag bằng 'id' (nếu là tag cũ) hoặc 'name'
          // Nếu không có, tạo Tag mới.
          if (tagObject.id) {
            return tagObject.id; // (Giả sử frontend gửi _id)
          }
          // (Nếu tagObject là { name: "New Tag" })
          let foundTag = await Tag.findOne({ name: tagObject.name });
          if (!foundTag) {
            foundTag = await Tag.create(tagObject);
          }
          return foundTag._id;
        })
      );
      tagIds.push(...createdTags);
    }

    // 5. BIẾN ĐỔI MAP (Mâu thuẫn 3 & 4)
    const specsMap = transformCollectionToMap(specifications);
    const propsMap = transformCollectionToMap(properties);

    // 6. CẬP NHẬT (UPDATE) LẠI PRODUCT (CHA)
    newProduct.variants = variantIds; // Gán mảng [ObjectId]
    newProduct.tags = tagIds;         // Gán mảng [ObjectId]
    newProduct.specifications = specsMap; // Gán Map
    newProduct.properties = propsMap;     // Gán Map

    // Lưu lại Product (lần 2) với đầy đủ thông tin
    const savedProduct = await newProduct.save();

    // 7. Populate và trả về
    const populatedProduct = await savedProduct.populate([
      { path: "category", select: "name slug" },
      { path: "brand", select: "name slug" },
      { path: "variants" },
      { path: "tags", select: "name" },
    ]);

    res.status(201).json(populatedProduct);

  } catch (error) {
    console.error("--- LỖI createProduct ---", error);
    res.status(400).json({ message: error.message });
  }
};
// Update product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate("category", "name slug")
      .populate("brand", "name slug")

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json(product)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({ message: "Product deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export default {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
}