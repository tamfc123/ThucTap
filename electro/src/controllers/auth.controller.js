import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Address from "../models/Address.js";
import Verification from "../models/Verification.js";
import { sendEmail } from "../utils/email.js";

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      roles: user.roles?.map(role => role.code), // 🟢 thêm roles
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};


// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username }).populate("roles");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        statusCode: 401,
        message: "Invalid credentials",
        timestamp: new Date().toISOString(),
      });
    }

    // Check if user is active
    if (user.status !== 1) {
      return res.status(401).json({
        statusCode: 401,
        message: "Account is inactive",
        timestamp: new Date().toISOString(),
      });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      createAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user info
// @route   GET /api/auth/info
// @access  Private
export const getUserInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("roles")
      .populate({
        path: "address",
        populate: [
          { path: "province" },
          { path: "district" },
          { path: "ward" },
        ],
      });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Register user
// @route   POST /api/auth/registration
// @access  Public
export const register = async (req, res, next) => {
  try {
    let { username, password, fullname, email, phone, gender, address } =
      req.body;
    console.log("📦 Registration body:", req.body);

    // 🔧 Chuẩn hóa address field từ FE (nếu có)
    if (address) {
      address = {
        line: address.line || null,
        province: address.provinceId || address.province || null,
        district: address.districtId || address.district || null,
        ward: address.wardId || address.ward || null,
      };
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({
        statusCode: 400,
        message: "User already exists",
        timestamp: new Date().toISOString(),
      });
    }

    // Create address if available
    let newAddress = null;
    if (address && address.line) {
      newAddress = await Address.create(address);
    }

    // Get or create role
    let customerRole = await Role.findOne({ code: "CUSTOMER" });
    if (!customerRole) {
      customerRole = await Role.create({
        code: "CUSTOMER",
        name: "Customer",
        status: 1,
      });
    }

    // Create user
    const user = await User.create({
      username,
      password,
      fullname,
      email,
      phone,
      gender,
      address: newAddress ? newAddress._id : null,
      status: 0,
      roles: [customerRole._id],
    });

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const code = Math.floor(100000 + Math.random() * 900000);
    await Verification.create({
      user: user._id,
      token,
      code,
      expiredAt,
      type: "REGISTRATION",
    });

    // Send email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}&userId=${user._id}`;
    await sendEmail({
      to: email,
      subject: "Email Verification",
      html: `
    <h2>Welcome, ${fullname || username}!</h2>
    <p>Mã xác nhận của bạn là: <b>${code}</b></p>
    <p>Hoặc click vào link sau để xác nhận:</p>
    <a href="${verificationUrl}" target="_blank">Verify Email</a>
    <p>Link này sẽ hết hạn trong 24 giờ.</p>
  `,
    });

    res.status(201).json({
      id: user._id,
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    if (error.name === "ValidationError") {
      for (let field in error.errors) {
        console.error(`⚠️ Field ${field}: ${error.errors[field].message}`);
      }
    }
    return res.status(400).json({
      statusCode: 400,
      message: error.message || "Registration failed",
    });
  }
};

// @desc    Confirm registration
// @route   POST /api/auth/registration/confirm
// @access  Public
export const confirmRegistration = async (req, res, next) => {
  try {
    const { userId, code, token } = req.body;

    console.log('Confirm registration request:', { userId, code, token }); // Debug log

    if (!userId) {
      return res.status(400).json({
        statusCode: 400,
        message: "Thiếu thông tin userId",
        timestamp: new Date().toISOString(),
      });
    }

    let verification;
    if (token) {
      verification = await Verification.findOne({
        user: userId,
        token: token,
        type: "REGISTRATION",
      });
    } else if (code) {
      verification = await Verification.findOne({
        user: userId,
        code: Number(code),
        type: "REGISTRATION",
      });
    } else {
      return res.status(400).json({
        statusCode: 400,
        message: "Thiếu token hoặc code xác nhận",
        timestamp: new Date().toISOString(),
      });
    }

    if (!verification) {
      return res.status(400).json({
        statusCode: 400,
        message: "Mã xác nhận không hợp lệ hoặc đã hết hạn",
        timestamp: new Date().toISOString(),
      });
    }

    if (verification.expiredAt < new Date()) {
      return res.status(400).json({
        statusCode: 400,
        message: "Mã xác nhận đã hết hạn",
        timestamp: new Date().toISOString(),
      });
    }

    // Activate user
    await User.findByIdAndUpdate(userId, { status: 1 });
    await Verification.findByIdAndDelete(verification._id);

    res.json({
      message: "Xác nhận email thành công",
    });
  } catch (error) {
    console.error('Confirm registration error:', error);
    next(error);
  }
};

// @desc    Resend registration token
// @route   POST /api/auth/registration/:userId/resend-token
// @access  Public
export const resendRegistrationToken = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
        timestamp: new Date().toISOString(),
      });
    }

    // Delete old verification
    await Verification.deleteMany({ user: userId, type: "REGISTRATION" });

    // Generate new token
    const token = crypto.randomBytes(32).toString("hex");
    const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const code = Math.floor(100000 + Math.random() * 900000);
    await Verification.create({
      user: userId,
      token,
      code,
      expiredAt,
      type: "REGISTRATION",
    });

    // Send email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}&userId=${userId}`;
    await sendEmail({
      to: user.email,
      subject: "Email Verification",
      html: `<p>Please click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
    });

    res.json({
      message: "Verification email sent",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
        timestamp: new Date().toISOString(),
      });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiredAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    const code = Math.floor(100000 + Math.random() * 900000);
    await Verification.create({
      user: user._id,
      token,
      code,
      expiredAt,
      type: "PASSWORD_RESET",
    });

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendEmail({
      to: email,
      subject: "Password Reset",
      html: `<p>Please click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    });

    res.json({
      message: "Password reset email sent",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const verification = await Verification.findOne({
      userId: userId,
      code: req.body.token,
      type: "PASSWORD_RESET",
    });

    if (!verification) {
      return res.status(400).json({
        statusCode: 400,
        message: "Invalid or expired token",
        timestamp: new Date().toISOString(),
      });
    }

    if (verification.expiredAt < new Date()) {
      return res.status(400).json({
        statusCode: 400,
        message: "Token has expired",
        timestamp: new Date().toISOString(),
      });
    }

    // Update password
    const user = await User.findById(verification.user);
    user.password = password;
    await user.save();

    await Verification.findByIdAndDelete(verification._id);

    res.json({
      message: "Password reset successful",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change registration email
// @route   PUT /api/auth/registration/:userId/change-email
// @access  Public
export const changeRegistrationEmail = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { email } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
        timestamp: new Date().toISOString(),
      });
    }

    // Cập nhật email
    user.email = email;
    await user.save();

    // Xóa token cũ
    await Verification.deleteMany({ user: userId, type: "REGISTRATION" });

    // Tạo token mới
    const token = crypto.randomBytes(32).toString("hex");
    const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const code = Math.floor(100000 + Math.random() * 900000);
    await Verification.create({
      user: userId,
      token,
      code,
      expiredAt,
      type: "REGISTRATION",
    });

    // Gửi mail mới
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}&userId=${userId}`;
    await sendEmail({
      to: email,
      subject: "Email Verification (New Email)",
      html: `
        <h2>Email Changed Successfully</h2>
        <p>Please verify your new email by clicking the button below:</p>
        <a href="${verificationUrl}" target="_blank" 
          style="display:inline-block;padding:10px 20px;background-color:#4CAF50;color:white;text-decoration:none;border-radius:5px;">
          Verify New Email
        </a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    res.json({
      message: "Email updated and verification email sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

export default {
  login,
  getUserInfo,
  register,
  confirmRegistration,
  resendRegistrationToken,
  forgotPassword,
  resetPassword,
  changeRegistrationEmail,
};
