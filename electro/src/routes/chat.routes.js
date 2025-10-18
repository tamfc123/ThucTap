import express from "express"
const router = express.Router()
//import  chatController from "../controllers/chat.controller.js"
import { authenticate, authorize } from "../middleware/auth.js"

// authenticateed routes - User
// router.get("/my-rooms", authenticate, chatController.getMyRooms)
// router.get("/room/:roomId/messages", authenticate, chatController.getRoomMessages)
// router.post("/room", authenticate, chatController.createRoom)

// // authenticateed routes - Admin
// router.get("/rooms", authenticate, authorize("ADMIN"), chatController.getAllRooms)

export default router
