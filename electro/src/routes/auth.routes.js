import express from "express"
import {
  login,
  getUserInfo,
  register,
  confirmRegistration,
  resendRegistrationToken,
  forgotPassword,
  resetPassword,
  changeRegistrationEmail,
} from "../controllers/auth.controller.js"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

router.post("/login", login)
router.get("/info", authenticate, getUserInfo)
router.post("/registration", register)
router.post("/registration/confirm", confirmRegistration)
router.post("/registration/:userId/resend-token", resendRegistrationToken)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)
router.put("/registration/:userId/change-email", changeRegistrationEmail);

export default router
