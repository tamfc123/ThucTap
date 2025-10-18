import express from "express";
import addressController from "../controllers/address.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.get("/", addressController.getAll);
router.get("/:id", addressController.getById);
router.post("/", authorize(["ADMIN"]), addressController.create);
router.put("/:id", authorize(["ADMIN"]), addressController.update);
router.delete("/", authorize(["ADMIN"]), addressController.deleteMany);

export default router;
