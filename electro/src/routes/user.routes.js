// ES Module import
import express from "express";
import userController from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.get("/verify-email/:token", userController.verifyEmail);
router.post("/resend-verification", userController.resendVerification);

// Protected routes - User
router.use(authenticate);
router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);
router.put("/change-password", userController.changePassword);
router.post("/upload-avatar", userController.uploadAvatar);

// Protected routes - Admin only
router.get("/", authorize("ADMIN"), userController.getAllUsers);
router.get("/:id", authorize("ADMIN"), userController.getUserById);
router.post("/", authorize("ADMIN"), userController.createUser);
router.put("/:id", authorize("ADMIN"), userController.updateUser);
router.delete("/:id", authorize("ADMIN"), userController.deleteUser);
router.put("/:id/status", authorize("ADMIN"), userController.updateUserStatus);
router.put("/:id/role", authorize("ADMIN"), userController.updateUserRole);

// ES Module export
export default router;
