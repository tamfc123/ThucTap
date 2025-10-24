import Product from "../models/Product.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import Wishlist from "../models/Wishlist.js";
import Preorder from "../models/Preorder.js";
import Notification from "../models/Notification.js";
import PaymentMethod from "../models/PaymentMethod.js";
import Room from "../models/Room.js";
import Reward from "../models/Reward.js";
import Brand from "../models/Brand.js";
import Variant from "../models/Variant.js";
import { randomUUID } from "crypto";
// Categories
export const getCategories = async (req, res, next) => {
  try {
    // 1. Đọc các tham số từ query string (do requestParams gửi lên)
    // Cung cấp giá trị mặc định phòng trường hợp frontend không gửi
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 8; // Lấy 'size' từ query, mặc định là 8
    const sort = req.query.sort || "priority,asc"; // Lấy 'sort', mặc định là 'priority,asc'
    const search = req.query.search || "";
    // (Lưu ý: req.query.filter là 'status==1' nhưng chúng ta đang cứng code { status: 1 }
    // nên không cần đọc filter nữa)

    // 2. Xây dựng query cơ bản
    const query = { status: 1 };
    if (search) {
      // Nếu bạn muốn hỗ trợ tìm kiếm, hãy thêm logic ở đây
      // Ví dụ: tìm theo tên
      query.name = { $regex: search, $options: "i" };
    }

    // 3. Xử lý 'sort'
    // Chuyển chuỗi "priority,asc" thành đối tượng { priority: 1 } cho Mongoose
    const sortObject = {};
    const [sortKey, sortOrder] = sort.split(","); // ["priority", "asc"]
    sortObject[sortKey] = sortOrder === "asc" ? 1 : -1; // { priority: 1 }

    // 4. Tính toán 'skip' để phân trang
    const skip = (page - 1) * size;

    // 5. Thực thi câu lệnh Mongoose đầy đủ
    const categories = await Category.find(query) // Lọc theo { status: 1 }
      .select("name slug description image parentCategory")
      .populate("parentCategory", "name slug")
      .sort(sortObject) // <-- SẮP XẾP theo yêu cầu
      .skip(skip) // <-- BỎ QUA các trang trước
      .limit(size); // <-- GIỚI HẠN số lượng (sẽ lấy 8)

    res.json(categories); // Bây giờ sẽ trả về đúng 8 danh mục

    // Console log để kiểm tra
    console.log(`categories client: Fetched ${categories.length} categories.`);
  } catch (error) {
    next(error);
  }
};
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      status: 1,
    }).populate("parentCategory", "name slug");
    console.log("category by slug:", category);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
};

// Products
export const getProducts = async (req, res, next) => {
  try {
    // 1. Sửa lại: Đọc 'saleable'
    const {
      page = 1,
      size = 12,
      sort = "-createdAt",
      category, // Đây là 'slug' (ví dụ: 'laptop')
      brand, // Đây là 'slug' (ví dụ: 'dell')
      minPrice,
      maxPrice,
      search,
      saleable,
    } = req.query;

    const query = { status: 1 };

    // === SỬA LẠI LOGIC LỌC ===

    // 2. Lọc Category (bằng Slug)
    if (category) {
      // Tìm ID của category dựa trên slug
      const categoryDoc = await Category.findOne({ slug: category }).select(
        "_id"
      );
      if (categoryDoc) {
        // (Giả sử trường trong Product model là 'categoryId')
        query.categoryId = categoryDoc._id;
      } else {
        // Nếu slug không tồn tại, trả về mảng rỗng
        return res.json({
          content: [],
          totalElements: 0,
          totalPages: 1,
          size: 0,
        });
      }
    }

    // 3. Lọc Brand (bằng Slug)
    if (brand) {
      const brandDoc = await Brand.findOne({ slug: brand }).select("_id");
      if (brandDoc) {
        // (Giả sử trường trong Product model là 'brandId')
        query.brandId = brandDoc._id;
      }
    }

    // 4. Lọc Giá (Code cũ của bạn đã đúng)
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 5. Lọc Search (Code cũ của bạn đã đúng)
    if (search) query.$text = { $search: search };

    // 6. Lọc 'saleable' (Đã thêm)
    // if (saleable === 'true') {
    //   // (Bạn phải có trường 'productSaleable' trong Product Model)
    //   query.productSaleable = true;
    // }

    // === KẾT THÚC SỬA LOGIC LỌC ===

    const products = await Product.find(query)
      .sort(sort)
      .limit(size * 1)
      .skip((page - 1) * size)
      .populate("categoryId brandId") // <-- Giữ nguyên
      .populate("variants") // <-- THÊM CÁI NÀY
      .select("-__v")
      .lean(); // <-- THÊM .lean()

    const total = await Product.countDocuments(query);

    // 7. BIẾN ĐỔI DỮ LIỆU (Rất quan trọng)
    // (Đây là logic từ câu trước, để tính priceRange và variants)
    const transformedProducts = products.map((product) => {
      const prices = (product.variants || []).map((v) => v.price);
      let priceRange = [0];
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        priceRange = minPrice === maxPrice ? [minPrice] : [minPrice, maxPrice];
      }
      const hasStock = (product.variants || []).some(
        (v) => (v.inventory || 0) > 0
      ); // Giả sử variant có 'inventory'
      const isSaleable = product.status === 1 && hasStock;
      const thumbnail =
        (product.images || []).find((img) => img.isThumbnail)?.path || null;
      const clientVariants = (product.variants || []).map((v) => ({
        variantId: v._id,
      }));

      return {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        images: product.images,
        productPriceRange: priceRange,
        variants: clientVariants,
        productSaleable: isSaleable,
        productPromotion: null, // (Tự thêm logic khuyến mãi)
      };
    });
    console.log("Transformed Products:", transformedProducts);

    res.json({
      content: transformedProducts, // <-- Gửi dữ liệu đã biến đổi
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size: products.length,
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to transform Map to CollectionWrapper (from previous examples)
const transformMapToCollection_Response = (mapData) => {
  if (!mapData || Object.keys(mapData).length === 0) {
    return { content: [] };
  }
  const content = [];
  for (const [key, value] of Object.entries(mapData)) {
    content.push({ code: key, name: key, value: value }); // You might need a lookup for 'name'
  }
  return { content: content };
};

// ============================================
// API: Get Product By Slug (Corrected)
// ============================================
export const getProductBySlug = async (req, res, next) => {
  try {
    const productFromDB = await Product.findOne({
      slug: req.params.slug,
      status: 1,
    })
      .populate("categoryId", "name slug") // Populate only needed fields
      .populate("brandId", "name slug") // Populate only needed fields
      .populate("variants") // Populate full variants (needed for details)
      // .populate("specifications") // Specifications are likely stored directly as Map, no need to populate
      .lean(); // <-- (1) Add .lean() for performance and easier object handling

    if (!productFromDB) {
      return res.status(404).json({ message: "Product not found" });
    }

    // (2) TRANSFORM THE DATA before sending

    // Calculate priceRange (similar to getProducts)
    const prices = (productFromDB.variants || []).map((v) => v.price);
    let priceRange = [0];
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      priceRange = minPrice === maxPrice ? [minPrice] : [minPrice, maxPrice];
    }

    // Calculate saleable (similar to getProducts)
    const hasStock = (productFromDB.variants || []).some(
      (v) => (v.inventory || 0) > 0
    ); // Check 'inventory' field
    const isSaleable = productFromDB.status === 1 && hasStock;

    // Get thumbnail (similar to getProducts)
    const thumbnail =
      (productFromDB.images || []).find((img) => img.isThumbnail)?.path || null;

    // Transform variants for CLIENT (EXCLUDE COST)
    const clientVariants = (productFromDB.variants || []).map((v) => ({
      variantId: v._id,
      sku: v.sku, // Client might need SKU for display
      price: v.price, // Send price
      // cost: v.cost, // <-- DO NOT SEND COST
      properties: transformMapToCollection_Response(v.properties), // Transform variant properties
      images: v.images || [], // Send variant-specific images if any
      inventory: v.inventory || 0, // Client might need inventory status
      status: v.status,
    }));

    // (Optional) Transform specifications and properties if needed by frontend
    const clientSpecifications = transformMapToCollection_Response(
      productFromDB.specifications
    );
    const clientProperties = transformMapToCollection_Response(
      productFromDB.properties
    );

    // Create the final client-safe product object
    const clientProduct = {
      _id: productFromDB._id,
      name: productFromDB.name,
      slug: productFromDB.slug,
      shortDescription: productFromDB.shortDescription,
      description: productFromDB.description, // Include full description
      images: productFromDB.images || [], // Include all images
      status: productFromDB.status,

      // Include category/brand info if needed
      category: productFromDB.categoryId
        ? {
          name: productFromDB.categoryId.name,
          slug: productFromDB.categoryId.slug,
        }
        : null,
      brand: productFromDB.brandId
        ? { name: productFromDB.brandId.name, slug: productFromDB.brandId.slug }
        : null,

      tags: productFromDB.tags || [], // You might want to populate tags with name/slug too

      specifications: clientSpecifications, // Include transformed specifications
      properties: clientProperties, // Include transformed properties

      variants: clientVariants, // Include DETAILED, client-safe variants
      weight: productFromDB.weight,

      // Add calculated fields
      productPriceRange: priceRange,
      productSaleable: isSaleable,
      productPromotion: null, // (Add promotion logic here)

      // You can add other fields like guaranteeId if needed, maybe populate it too
    };

    // (3) Increment view count (This part can stay, but use the lean object)
    // Note: .save() won't work on a lean object. Update directly.
    await Product.updateOne({ _id: productFromDB._id }, { $inc: { views: 1 } });

    // (4) Send the TRANSFORMED data
    res.json(clientProduct);
  } catch (error) {
    next(error);
  }
};

// Filters
export const getFiltersByCategory = async (req, res, next) => {
  try {
    const { slug } = req.query;
    const category = await Category.findOne({ slug });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const brands = await Product.distinct("brand", { category: category._id });
    const priceRange = await Product.aggregate([
      { $match: { category: category._id } },
      {
        $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } },
      },
    ]);

    res.json({
      brands,
      priceRange: priceRange[0] || { min: 0, max: 0 },
    });
  } catch (error) {
    next(error);
  }
};

export const getFiltersBySearch = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = search ? { $text: { $search: search } } : {};

    const brands = await Product.distinct("brand", query);
    const categories = await Product.distinct("category", query);

    res.json({ brands, categories });
  } catch (error) {
    next(error);
  }
};

// User Info & Settings
export const getUserInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password") // <-- Đường dẫn là 'address'
      .populate("address.provinceId", "name code")
      .populate("address.districtId", "name code")
      .populate("address.wardId", "name code")
      .populate("roles");
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updatePersonalInfo = async (req, res, next) => {
  try {
    const { fullName, gender, dateOfBirth, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, gender, dateOfBirth, avatar },
      { new: true, runValidators: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updatePhone = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { phone },
      { new: true, runValidators: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { email },
      { new: true, runValidators: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    // === THÊM ĐOẠN NÀY ĐỂ BẪY LỖI ===
    if (error.code === 11000) {
      // Nếu là lỗi E11000 (trùng key)
      return res.status(400).json({
        message: "Email này đã được sử dụng bởi một tài khoản khác.",
        field: "email"
      });
    }
    // Nếu là lỗi khác, mới đẩy ra lỗi 500
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id); // Dòng này OK

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    // SỬA TÊN HÀM Ở ĐÂY
    const isMatch = await user.matchPassword(oldPassword); // Đổi từ comparePassword -> matchPassword

    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    // Hook pre('save') của bạn sẽ tự động hash mật khẩu mới
    user.password = newPassword;
    await user.save();

    res.json({ message: "Cập nhật mật khẩu thành công" });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "categoryId brandId variants specifications"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Optional: tăng view
    product.views = (product.views || 0) + 1;
    await product.save();

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// Wishlist
export const getWishlist = async (req, res, next) => {
  try {
    const { page = 1, size = 10 } = req.query;
    const wishlist = await Wishlist.find({ user: req.user.id })
      .populate("product")
      .limit(size * 1)
      .skip((page - 1) * size);

    const total = await Wishlist.countDocuments({ user: req.user.id });

    res.json({
      content: wishlist,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const existing = await Wishlist.findOne({
      user: req.user.id,
      product: productId,
    });
    console.log("Existing wishlist item:", existing);

    if (existing) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    const wishlist = new Wishlist({ user: req.user.id, product: productId });
    await wishlist.save();

    // === THÊM DÒNG NÀY ĐỂ POPULATE ===
    // Nó sẽ thay thế 'productId' bằng toàn bộ object 'product'
    await wishlist.populate('product');
    // Bạn cũng có thể populate 'user' nếu cần: await wishlist.populate('product user');
    // === LOG Ở ĐÂY ===
    console.log("Backend log - Data gửi về client:", JSON.stringify(wishlist, null, 2));

    res.status(201).json(wishlist); // 'wishlist' bây giờ chứa đầy đủ object 'product'
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const ids = req.body;
    await Wishlist.deleteMany({ _id: { $in: ids }, user: req.user.id });
    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    next(error);
  }
};

// Preorders
export const getPreorders = async (req, res, next) => {
  try {
    const { page = 1, size = 10 } = req.query;
    const preorders = await Preorder.find({ user: req.user.id })
      .populate("product")
      .limit(size * 1)
      .skip((page - 1) * size);

    const total = await Preorder.countDocuments({ user: req.user.id });

    res.json({
      content: preorders,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    next(error);
  }
};

export const createPreorder = async (req, res, next) => {
  try {
    const preorder = new Preorder({ ...req.body, user: req.user.id });
    await preorder.save();
    res.status(201).json(preorder);
  } catch (error) {
    next(error);
  }
};

export const updatePreorder = async (req, res, next) => {
  try {
    const { id, ...updateData } = req.body;
    const preorder = await Preorder.findOneAndUpdate(
      { _id: id, user: req.user.id },
      updateData,
      { new: true }
    );
    res.json(preorder);
  } catch (error) {
    next(error);
  }
};

export const deletePreorders = async (req, res, next) => {
  try {
    const { ids } = req.body;
    await Preorder.deleteMany({ _id: { $in: ids }, user: req.user.id });
    res.json({ message: "Preorders deleted" });
  } catch (error) {
    next(error);
  }
};

// Reviews
export const getUserReviews = async (req, res, next) => {
  try {
    const { page = 1, size = 10 } = req.query;
    const reviews = await Review.find({ user: req.user.id })
      .populate("product")
      .limit(size * 1)
      .skip((page - 1) * size);

    const total = await Review.countDocuments({ user: req.user.id });

    res.json({
      content: reviews,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const { page = 1, size = 10 } = req.query;
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviews = await Review.find({
      product: product._id,
      status: "APPROVED",
    })
      .populate("user", "fullName avatar")
      .limit(size * 1)
      .skip((page - 1) * size)
      .sort("-createdAt");

    const total = await Review.countDocuments({
      product: product._id,
      status: "APPROVED",
    });

    res.json({
      content: reviews,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const review = new Review({ ...req.body, user: req.user.id });
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

export const deleteReviews = async (req, res, next) => {
  try {
    const { ids } = req.body;
    await Review.deleteMany({ _id: { $in: ids }, user: req.user.id });
    res.json({ message: "Reviews deleted" });
  } catch (error) {
    next(error);
  }
};

// Notifications
export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, size = 10 } = req.query;
    const notifications = await Notification.find({ user: req.user.id })
      .sort("-createdAt")
      .limit(size * 1)
      .skip((page - 1) * size);

    const total = await Notification.countDocuments({ user: req.user.id });

    res.json({
      content: notifications,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    next(error);
  }
};

export const initNotificationEvents = async (req, res, next) => {
  try {
    // Sử dụng hàm đã import, không cần "crypto." nữa
    const eventSourceUuid = randomUUID();
    res.json({ eventSourceUuid });
  } catch (error) {
    next(error);
  }
};

export const updateNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      {
        new: true,
      }
    );
    res.json(notification);
  } catch (error) {
    next(error);
  }
};

// Cart
export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product items.variant"
    );
    res.json(cart || { items: [] });
  } catch (error) {
    next(error);
  }
};

export const saveCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (cart) {
      cart.items = req.body.items;
      await cart.save();
    } else {
      cart = new Cart({ user: req.user.id, items: req.body.items });
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { itemIds } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });

    if (cart) {
      cart.items = cart.items.filter(
        (item) => !itemIds.includes(item._id.toString())
      );
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// Orders
// Thay thế hàm getOrders cũ
export const getOrders = async (req, res, next) => {
  try {
    const { page = 1, size = 10, status } = req.query; // Thêm lại 2 dòng này để phân trang

    const skip = (page - 1) * size;
    const limit = Number.parseInt(size);

    const query = { user: req.user.id };
    if (status) query.status = status; // 1. POPULATE LỒNG NHAU + .lean()

    const orders = await Order.find(query)
      .sort("-createdAt")
      .skip(skip) // Dùng skip
      .limit(limit) // Dùng limit
      .populate({
        path: "orderVariants.variant", // Populate 'variant'
        model: "Variant",
        populate: {
          path: "product", // *Bên trong* 'variant', populate tiếp 'product'
          model: "Product",
          select: "name slug images", // Chỉ lấy các trường cần thiết
        },
      })
      .lean(); // <-- Dùng .lean() để biến đổi dữ liệu

    const total = await Order.countDocuments(query); // 2. BIẾN ĐỔI (TRANSFORM) DỮ LIỆU

    const transformedOrders = orders.map((order) => {
      const transformedVariants = order.orderVariants.map((item) => {
        // Xử lý nếu variant/product đã bị xóa
        if (!item.variant || !item.variant.product) {
          return {
            ...item,
            variant: {
              name: "Sản phẩm không tồn tại",
              slug: "#",
              thumbnail: null,
            },
          };
        }

        const product = item.variant.product;
        const thumbnail =
          product.images.find((img) => img.isThumbnail)?.path || null; // Tạo object 'variant' phẳng mà frontend mong đợi

        const newVariant = {
          _id: item.variant._id,
          name: product.name,
          slug: product.slug,
          thumbnail: thumbnail,
          properties: item.variant.properties, // Giữ lại size/color...
        };

        return {
          ...item, // Giữ lại _id, price, quantity
          variant: newVariant, // Ghi đè 'variant' cũ
        };
      });

      return {
        ...order,
        orderVariants: transformedVariants, // Ghi đè 'orderVariants' cũ
      };
    }); // console.log('Fetched Orders:', transformedOrders); // Log dữ liệu đã biến đổi // 3. TRẢ VỀ DỮ LIỆU ĐÃ BIẾN ĐỔI

    res.json({
      content: transformedOrders, // <-- Gửi đi dữ liệu mới
      totalElements: total,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    next(error);
  }
};

// Thay thế hàm getOrderByCode cũ
export const getOrderByCode = async (req, res, next) => {
  try {
    // 1. POPULATE LỒNG NHAU + .lean()
    const order = await Order.findOne({
      code: req.params.code,
      user: req.user.id,
    })
      .populate("user", "fullname email phone")
      .populate({
        path: "orderVariants.variant", // Populate 'variant'
        model: "Variant",
        populate: {
          path: "product", // *Bên trong* 'variant', populate tiếp 'product'
          model: "Product",
          select: "name slug images",
        },
      })
      .lean(); // <-- Dùng .lean()

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    } // 2. BIẾN ĐỔI (TRANSFORM) DỮ LIỆU

    const transformedVariants = order.orderVariants.map((item) => {
      if (!item.variant || !item.variant.product) {
        return {
          ...item,
          variant: {
            name: "Sản phẩm không tồn tại",
            slug: "#",
            thumbnail: null,
          },
        };
      }

      const product = item.variant.product;
      const thumbnail =
        product.images.find((img) => img.isThumbnail)?.path || null;

      const newVariant = {
        _id: item.variant._id,
        name: product.name,
        slug: product.slug,
        thumbnail: thumbnail,
        properties: item.variant.properties,
      };

      return {
        ...item,
        variant: newVariant,
      };
    });

    const transformedOrder = { ...order, orderVariants: transformedVariants }; // console.log('Fetched Order:', transformedOrder); // 3. TRẢ VỀ DỮ LIỆU ĐÃ BIẾN ĐỔI

    res.json(transformedOrder);
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const orderCode = "ORD" + Date.now();
    const order = new Order({
      ...req.body,
      user: req.user.id,
      code: orderCode,
      status: "PENDING",
    });
    await order.save();

    // Clear cart after order
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      code: req.params.code,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "PENDING") {
      return res.status(400).json({ message: "Cannot cancel this order" });
    }

    order.status = "CANCELLED";
    await order.save();

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// Payment Methods
export const getPaymentMethods = async (req, res, next) => {
  try {
    const paymentMethods = await PaymentMethod.find({ status: 1 });
    res.json(paymentMethods);
  } catch (error) {
    next(error);
  }
};

// Chat
export const getChatRoom = async (req, res, next) => {
  try {
    const room = await Room.findOne({ user: req.user.id });
    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const createChatRoom = async (req, res, next) => {
  try {
    let room = await Room.findOne({ user: req.user.id });

    if (!room) {
      room = new Room({ user: req.user.id, name: `Room ${req.user.id}` });
      await room.save();
    }

    res.json(room);
  } catch (error) {
    next(error);
  }
};

// Rewards
export const getRewards = async (req, res, next) => {
  try {
    const rewards = await Reward.find({ user: req.user.id });
    res.json(rewards);
  } catch (error) {
    next(error);
  }
};

export default {
  getCategories,
  getCategoryBySlug,
  getProducts,
  getProductBySlug,
  getFiltersByCategory,
  getFiltersBySearch,
  getUserInfo,
  updatePersonalInfo,
  updatePhone,
  updateEmail,
  updatePassword,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getPreorders,
  createPreorder,
  updatePreorder,
  deletePreorders,
  getUserReviews,
  getProductReviews,
  createReview,
  deleteReviews,
  getNotifications,
  initNotificationEvents,
  updateNotification,
  getCart,
  saveCart,
  removeFromCart,
  getOrders,
  getOrderByCode,
  createOrder,
  cancelOrder,
  getPaymentMethods,
  getChatRoom,
  createChatRoom,
  getRewards,
  getProductById,
};
