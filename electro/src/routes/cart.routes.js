import express from 'express';
const router = express.Router();
import cartController from '../controllers/cart.controller.js';
import { authenticate } from "../middleware/auth.js"

// Tất cả routes đều cần xác thực
router.get('/', authenticate, cartController.getCart);
router.post('/', authenticate, cartController.saveCart);
router.delete('/', authenticate, cartController.deleteCartItems);

export default router;