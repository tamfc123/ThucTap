import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const authenticate = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
      return res.status(401).json({
        statusCode: 401,
        message: "Not authorized to access this route",
        timestamp: new Date().toISOString(),
      })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).populate("roles")

      if (!req.user) {
        return res.status(401).json({
          statusCode: 401,
          message: "User not found",
          timestamp: new Date().toISOString(),
        })
      }

      next()
    } catch (error) {
      return res.status(401).json({
        statusCode: 401,
        message: "Token is invalid or expired",
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    next(error)
  }
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    const userRoles = req.user.roles.map((role) => role.code)
    console.log("🧠 User roles:", userRoles);
    console.log("🔐 Required roles:", roles);
    if (!roles.some((role) => userRoles.includes(role))) {
      return res.status(403).json({
        statusCode: 403,
        message: "User role is not authorized to access this route",
        timestamp: new Date().toISOString(),
      })
    }

    next()
  }
}

