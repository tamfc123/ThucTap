import express from "express"
const router = express.Router()
import  clientController from "../controllers/client.controller.js"
import { authenticate } from "../middleware/auth.js"

// Public routes
router.get("/categories", clientController.getCategories)
router.get("/categories/:slug", clientController.getCategoryBySlug)
router.get("/products", clientController.getProducts)
router.get("/products/:slug", clientController.getProductBySlug)
router.get("/filters/category", clientController.getFiltersByCategory)
router.get("/filters/search", clientController.getFiltersBySearch)
router.get("/payment-methods", clientController.getPaymentMethods)
router.get("/reviews/products/:slug", clientController.getProductReviews)

// Protected routes
router.use(authenticate)

// User info & settings
router.get("/users/info", clientController.getUserInfo)
router.post("/users/personal", clientController.updatePersonalInfo)
router.post("/users/phone", clientController.updatePhone)
router.post("/users/email", clientController.updateEmail)
router.post("/users/password", clientController.updatePassword)

// Wishlist
router.get("/wishes", clientController.getWishlist)
router.post("/wishes", clientController.addToWishlist)
router.delete("/wishes", clientController.removeFromWishlist)

// Preorders
router.get("/preorders", clientController.getPreorders)
router.post("/preorders", clientController.createPreorder)
router.put("/preorders", clientController.updatePreorder)
router.delete("/preorders", clientController.deletePreorders)

// Reviews
router.get("/reviews", clientController.getUserReviews)
router.post("/reviews", clientController.createReview)
router.delete("/reviews", clientController.deleteReviews)

// Notifications
router.get("/notifications", clientController.getNotifications)
router.get("/notifications/init-events", clientController.initNotificationEvents)
router.put("/notifications/:id", clientController.updateNotification)

// Cart
router.get("/carts", clientController.getCart)
router.post("/carts", clientController.saveCart)
router.delete("/carts", clientController.removeFromCart)

// Orders
router.get("/orders", clientController.getOrders)
router.get("/orders/:code", clientController.getOrderByCode)
router.post("/orders", clientController.createOrder)
router.put("/orders/cancel/:code", clientController.cancelOrder)

// Chat
router.get("/chat/get-room", clientController.getChatRoom)
router.post("/chat/create-room", clientController.createChatRoom)

// Rewards
router.get("/rewards", clientController.getRewards)

export default router
