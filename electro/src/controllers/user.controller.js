import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";


// Register new user
export const register = async (req, res) => {
  try {
    const { username, email, password, fullname, phone } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return res.status(400).json({ message: "Email hoặc username đã tồn tại" })
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")

    // Create new user
    const user = new User({
      username,
      email,
      password,
      fullname,
      phone,
      verificationToken,
      role: "USER",
    })

    await user.save()

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`
    await sendEmail({
      to: email,
      subject: "Xác thực tài khoản",
      html: `<p>Vui lòng click vào link sau để xác thực tài khoản: <a href="${verificationUrl}">${verificationUrl}</a></p>`,
    })

    res.status(201).json({
      message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body

    // Find user
    const user = await User.findOne({ username }).select("+password")
    if (!user) {
      return res.status(401).json({ message: "Username hoặc password không đúng" })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Username hoặc password không đúng" })
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({ message: "Vui lòng xác thực email trước khi đăng nhập" })
    }

    // Check if account is active
    if (user.status !== "ACTIVE") {
      return res.status(401).json({ message: "Tài khoản đã bị khóa" })
    }

    // Generate token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    })

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params

    const user = await User.findOne({ verificationToken: token })
    if (!user) {
      return res.status(400).json({ message: "Token không hợp lệ" })
    }

    user.isEmailVerified = true
    user.verificationToken = undefined
    await user.save()

    res.json({ message: "Xác thực email thành công" })
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Resend verification email
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại" })
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email đã được xác thực" })
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    user.verificationToken = verificationToken
    await user.save()

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`
    await sendEmail({
      to: email,
      subject: "Xác thực tài khoản",
      html: `<p>Vui lòng click vào link sau để xác thực tài khoản: <a href="${verificationUrl}">${verificationUrl}</a></p>`,
    })

    res.json({ message: "Email xác thực đã được gửi lại" })
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại" })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = Date.now() + 3600000 // 1 hour
    await user.save()

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
    await sendEmail({
      to: email,
      subject: "Đặt lại mật khẩu",
      html: `<p>Vui lòng click vào link sau để đặt lại mật khẩu: <a href="${resetUrl}">${resetUrl}</a></p><p>Link này sẽ hết hạn sau 1 giờ.</p>`,
    })

    res.json({ message: "Email đặt lại mật khẩu đã được gửi" })
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" })
    }

    user.password = newPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: "Đặt lại mật khẩu thành công" })
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { fullname, phone, gender, dateOfBirth } = req.body

    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" })
    }

    if (fullname) user.fullname = fullname
    if (phone) user.phone = phone
    if (gender) user.gender = gender
    if (dateOfBirth) user.dateOfBirth = dateOfBirth

    await user.save()

    res.json({ message: "Cập nhật thông tin thành công", user })
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user.userId).select("+password")
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" })
    }

    // Check current password
    const isPasswordValid = await user.comparePassword(currentPassword)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Mật khẩu hiện tại không đúng" })
    }

    user.password = newPassword
    await user.save()

    res.json({ message: "Đổi mật khẩu thành công" })
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Upload avatar
export const uploadAvatar = async (req, res) => {
  try {
    const { avatar } = req.body

    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" })
    }

    user.avatar = avatar
    await user.save()

    res.json({ message: "Cập nhật avatar thành công", avatar: user.avatar })
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Admin: Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, size = 10, search, role, status } = req.query

    const query = {}
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { fullname: { $regex: search, $options: "i" } },
      ]
    }
    if (role) query.role = role
    if (status) query.status = status

    const users = await User.find(query)
      .limit(size * 1)
      .skip((page - 1) * size)
      .sort({ createdAt: -1 })
      .lean()

    const total = await User.countDocuments(query)

    res.json({
      content: users,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size: Number.parseInt(size),
      number: Number.parseInt(page) - 1,
    })
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Admin: Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('roles', 'name code') // <-- Lấy chi tiết 'roles' (chỉ lấy name và code)
      .populate({ // 2. Populate 'address' (dùng cú pháp object)
        path: 'address', // <-- Đường dẫn là 'address'
        populate: [ // <-- BÊN TRONG 'address', populate tiếp:
          { path: 'province', select: 'name code' }, // Lấy chi tiết 'province'
          { path: 'district', select: 'name code' }, // Lấy chi tiết 'district'
          { path: 'ward', select: 'name code' }      // Lấy chi tiết 'ward'
        ]
      });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Admin: Create user
export const createUser = async (req, res) => {
  try {
    const { username, email, password, fullname, phone, role } = req.body

    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return res.status(400).json({ message: "Email hoặc username đã tồn tại" })
    }

    const user = new User({
      username,
      email,
      password,
      fullname,
      phone,
      role: role || "USER",
      isEmailVerified: true, // Admin created users are auto-verified
    })

    await user.save()

    res.status(201).json({ message: "Tạo người dùng thành công", user })
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Admin: Update user
export const updateUser = async (req, res) => {
  try {
    const { username, email, fullname, phone, role, status } = req.body

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" })
    }

    if (username) user.username = username
    if (email) user.email = email
    if (fullname) user.fullname = fullname
    if (phone) user.phone = phone
    if (role) user.role = role
    if (status) user.status = status

    await user.save()

    res.json({ message: "Cập nhật người dùng thành công", user })
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Admin: Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" })
    }

    res.json({ message: "Xóa người dùng thành công" })
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Admin: Update user status
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" })
    }

    user.status = status
    await user.save()

    res.json({ message: "Cập nhật trạng thái thành công", user })
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Admin: Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" })
    }

    user.role = role
    await user.save()

    res.json({ message: "Cập nhật vai trò thành công", user })
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

export default {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateUserRole,
}