import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Variant from "../models/Variant.js";
import Product from "../models/Product.js";

// HELPER: Biến đổi Response (DB Object) -> CollectionWrapper (Frontend)
// Thêm hàm này vào đầu file cart.controller.js
const transformMapToCollection_Response = (mapData) => {
  if (!mapData || Object.keys(mapData).length === 0) {
    return { content: [] };
  }
  const content = [];
  for (const [key, value] of Object.entries(mapData)) {
    content.push({ id: key, code: key, name: key, value: value });
  }
  return { content: content };
};

// Lấy giỏ hàng của user
export const getCart = async (req, res) => {
  try {
    console.log('=== GET CART DEBUG START ===');

    // 🔽 THÊM KIỂM TRA XÁC THỰC (GIỐNG saveCart)
    if (!req.user || !req.user._id) { 
      console.error('❌ GET CART ERROR: req.user không được xác thực.');
      return res.status(401).json({ message: 'Lỗi xác thực: Người dùng không hợp lệ.' });
    }
    
    const userId = req.user._id; // ◀ Dùng _id
    console.log('User:', userId);

    // 🔽 ĐÂY LÀ POPULATE ĐÚNG, DÙNG 'cartVariants.variant'
    let cart = await Cart.findOne({ user: userId })
      .populate({
        path: 'cartVariants.variant', // ◀ KHÔNG PHẢI 'items.product'
        populate: {
          path: 'product',
          select: 'name slug images promotion'
        }
      })
      .lean();

    console.log('Cart found:', !!cart);
    console.log('Cart variants count:', cart ? cart.cartVariants.length : 0);

    // Nếu không có giỏ hàng, tạo mới (logic này RẤT QUAN TRỌNG)
    if (!cart) {
      console.log('Creating new cart...');
      cart = await Cart.create({ user: userId, cartVariants: [] });
      console.log('New cart created:', cart._id);
    }

    // TRANSFORM DATA VỚI XỬ LÝ LỖI (Phần này bạn đã có)
    const transformedCart = {
      cartId: cart._id,
      cartItems: cart.cartVariants.map(item => {
        try {
          // KIỂM TRA VARIANT CÓ TỒN TẠI KHÔNG
          if (!item.variant) {
            console.warn('Variant not found for item:', item);
            return null;
          }

          // KIỂM TRA PRODUCT CÓ TỒN TẠI KHÔNG
          if (!item.variant.product) {
            console.warn('Product not found for variant:', item.variant);
            return {
              // ... (trả về placeholder như code cũ)
              cartItemVariant: {
                variantId: item.variant._id,
                variantProduct: {
                  productId: 'unknown',
                  productName: 'Product Not Found',
                  // ...
                },
                // ...
              },
              cartItemQuantity: item.quantity
            };
          }

          return {
            cartItemVariant: {
              variantId: item.variant._id,
              variantProduct: {
                productId: item.variant.product._id,
                productName: item.variant.product.name,
                productSlug: item.variant.product.slug,
                productThumbnail: (() => {
                  const images = item.variant.product.images;
                  if (!images || images.length === 0) return null;
                  const thumbnailImage = images.find(img => img.isThumbnail);
                  return thumbnailImage ? thumbnailImage.path : images[0].path; 
                })(),
                productPromotion: item.variant.product.promotion
              },
              variantPrice: item.variant.price,
              variantProperties: transformMapToCollection_Response(item.variant.properties),
              variantInventory: item.variant.inventory
            },
            cartItemQuantity: item.quantity
          };
        } catch (error) {
          console.error('Error processing cart item:', error);
          return null;
        }
      }).filter(item => item !== null)
    };

    console.log('Transformed cart items count:', transformedCart.cartItems.length);
    console.log('=== GET CART DEBUG END ===');

    res.json(transformedCart); // ◀ Trả về giỏ hàng đã biến đổi

  } catch (error) {
    console.error('❌ GET CART ERROR:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'Lỗi server khi lấy giỏ hàng',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Thêm/sửa giỏ hàng
export const saveCart = async (req, res) => {
  try {
    console.log("🔵 === SAVE CART CONTROLLER START ===");
    console.log("🟢 Request received at:", new Date().toISOString());

    // FIX: Kiểm tra req.user trước khi truy cập
    if (!req.user || !req.user._id) {
      console.error(
        "❌ SAVE CART ERROR: req.user không tồn tại. Middleware authenticate có vấn đề."
      );
      return res.status(401).json({ message: "Lỗi xác thực người dùng" });
    }

    const userId = req.user._id;
    const { cartItems, updateQuantityType } = req.body;

    console.log("👤 User ID:", userId);
    console.log("📦 Cart items received:", JSON.stringify(cartItems, null, 2));
    console.log("🔄 Update type:", updateQuantityType);

    // TÌM CART
    console.log("🔍 Looking for existing cart...");
    let cart = await Cart.findOne({ user: userId });
    console.log("📋 Cart found:", cart ? `Yes (${cart._id})` : "No");

    if (!cart) {
      console.log("🆕 Creating new cart...");
      cart = new Cart({ user: userId, cartVariants: [] });
      await cart.save();
      console.log("✅ New cart created:", cart._id);
    }

    console.log("📊 Cart before processing:");
    console.log("- Cart ID:", cart._id);
    console.log("- Variants count:", cart.cartVariants.length);
    console.log("- Variants:", JSON.stringify(cart.cartVariants, null, 2));

    // XỬ LÝ TỪNG ITEM
    console.log("🔄 Processing cart items...");
    let processedItems = 0;

    for (const item of cartItems) {
      processedItems++;
      console.log(`\n📦 Processing item ${processedItems}:`, item);

      // KIỂM TRA VARIANT ID
      console.log("🔍 Checking variant ID...");
      const isValidObjectId = mongoose.Types.ObjectId.isValid(item.variantId);
      console.log("✅ Variant ID valid:", isValidObjectId);

      if (!isValidObjectId) {
        console.log("❌ Invalid variant ID, skipping");
        continue;
      }

      // KIỂM TRA VARIANT TỒN TẠI
      console.log("🔍 Checking if variant exists in database...");
      const variant = await Variant.findById(item.variantId);
      console.log("✅ Variant exists:", !!variant);

      if (!variant) {
        console.log("❌ Variant not found, skipping");
        continue;
      }

      console.log("🎯 Variant details:", {
        id: variant._id,
        sku: variant.sku,
        price: variant.price,
        inventory: variant.inventory,
      });

      // TÌM ITEM ĐÃ TỒN TẠI
      console.log("🔍 Looking for existing item in cart...");
      const existingItemIndex = cart.cartVariants.findIndex(
        (cartItem) =>
          cartItem.variant && cartItem.variant.toString() === item.variantId
      );
      console.log("📌 Existing item index:", existingItemIndex);

      if (existingItemIndex > -1) {
        // UPDATE EXISTING ITEM
        console.log("📝 Updating existing item...");
        if (updateQuantityType === "OVERRIDE") {
          cart.cartVariants[existingItemIndex].quantity = item.quantity;
        } else {
          cart.cartVariants[existingItemIndex].quantity += item.quantity;
        }
        console.log(
          "✅ Updated quantity:",
          cart.cartVariants[existingItemIndex].quantity
        );
      } else {
        // ADD NEW ITEM
        console.log("🆕 Adding new item to cart...");
        const newCartItem = {
          variant: new mongoose.Types.ObjectId(item.variantId),
          quantity: item.quantity,
        };
        console.log("📥 New cart item:", newCartItem);

        cart.cartVariants.push(newCartItem);
        console.log("✅ Item added to cart variants");
      }
    }

    console.log("\n📊 Cart after processing:");
    console.log("- Variants count:", cart.cartVariants.length);
    console.log("- Variants:", JSON.stringify(cart.cartVariants, null, 2));

    // LƯU CART
    console.log("💾 Saving cart...");
    const savedCart = await cart.save();
    console.log("✅ Cart saved successfully");
    console.log("📋 Saved cart variants count:", savedCart.cartVariants.length);

    // POPULATE ĐỂ TRẢ VỀ
    console.log("🔍 Populating cart data...");
    const populatedCart = await Cart.findById(savedCart._id).populate({
      path: "cartVariants.variant",
      populate: {
        path: "product",
        select: "name slug thumbnail",
      },
    });

    console.log(
      "✅ Populated cart variants count:",
      populatedCart.cartVariants.length
    );

    // TRANSFORM DATA
    const transformedCart = {
      cartId: populatedCart._id,
      cartItems: populatedCart.cartVariants.map((item) => ({
        cartItemVariant: {
          variantId: item.variant._id,
          variantProduct: {
            productId: item.variant.product?._id || "unknown",
            productName: item.variant.product?.name || "Unknown Product",
            productSlug: item.variant.product?.slug || "unknown",
            productThumbnail: item.variant.product?.thumbnail || null,
            productPromotion: item.variant.product?.promotion || null,
          },
          variantPrice: item.variant.price || 0,
          variantProperties: item.variant.properties || null,
          variantInventory: item.variant.inventory || 0,
        },
        cartItemQuantity: item.quantity,
      })),
    };

    console.log("🎉 Final transformed cart:");
    console.log("- Cart ID:", transformedCart.cartId);
    console.log("- Items count:", transformedCart.cartItems.length);
    console.log("🔵 === SAVE CART CONTROLLER END ===");

    res.json(transformedCart);
  } catch (error) {
    console.error("❌ SAVE CART ERROR:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Lỗi server khi lưu giỏ hàng",
      error: error.message,
    });
  }
};

// Xóa items khỏi giỏ hàng
export const deleteCartItems = async (req, res) => {
  try {
    const userId = req.user._id;
    const itemsToDelete = req.body; // Đây là một mảng, ví dụ: [{ cartId, variantId }, ...]

    if (
      !itemsToDelete ||
      !Array.isArray(itemsToDelete) ||
      itemsToDelete.length === 0
    ) {
      return res.status(400).json({ message: "Không có sản phẩm nào để xóa" });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }

    // Lấy danh sách TẤT CẢ các variantId cần xóa từ req.body
    const variantIdsToDelete = itemsToDelete.map((item) =>
      item.variantId.toString()
    );

    // Lọc ra: *GIỮ LẠI* những item KHÔNG nằm trong danh sách cần xóa
    cart.cartVariants = cart.cartVariants.filter(
      (item) => !variantIdsToDelete.includes(item.variant.toString())
    );

    await cart.save();

    res.json({
      message: `Xóa thành công ${variantIdsToDelete.length} sản phẩm`,
    });
  } catch (error) {
    console.error("Delete cart items error:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

export default {
  getCart,
  saveCart,
  deleteCartItems,
};
