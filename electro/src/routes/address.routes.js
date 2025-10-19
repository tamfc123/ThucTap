import express from "express";
import addressController from "../controllers/address.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();


router.get("/", addressController.getAll);
router.get("/:id", addressController.getById);
router.post("/", authenticate, authorize("ADMIN"), addressController.create);
router.put("/:id", authenticate, authorize("ADMIN"), addressController.update);
router.delete("/", authenticate, authorize("ADMIN"), addressController.deleteMany);

export default router;
