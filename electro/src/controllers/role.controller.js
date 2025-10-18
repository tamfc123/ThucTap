import e from "express"
import Role from "../models/Role.js"

// Get all roles with pagination
export const getAllRoles = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const filter = {}
    if (req.query.status) {
      filter.status = Number.parseInt(req.query.status)
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { code: { $regex: req.query.search, $options: "i" } },
      ]
    }

    const [roles, total] = await Promise.all([
      Role.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Role.countDocuments(filter),
    ])

    res.json({
      roles,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get role by ID
export const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
    if (!role) {
      return res.status(404).json({ message: "Role not found" })
    }
    res.json(role)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create new role
export const createRole = async (req, res) => {
  try {
    const { code, name, status } = req.body

    // Check if role code already exists
    const existingRole = await Role.findOne({ code })
    if (existingRole) {
      return res.status(400).json({ message: "Role code already exists" })
    }

    const role = new Role({
      code,
      name,
      status: status !== undefined ? status : 1,
    })

    const savedRole = await role.save()
    res.status(201).json(savedRole)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Update role
export const updateRole = async (req, res) => {
  try {
    const { code, name, status } = req.body

    // Check if new code conflicts with existing role
    if (code) {
      const existingRole = await Role.findOne({
        code,
        _id: { $ne: req.params.id },
      })
      if (existingRole) {
        return res.status(400).json({ message: "Role code already exists" })
      }
    }

    const role = await Role.findByIdAndUpdate(req.params.id, { code, name, status }, { new: true, runValidators: true })

    if (!role) {
      return res.status(404).json({ message: "Role not found" })
    }

    res.json(role)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Delete role
export const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id)
    if (!role) {
      return res.status(404).json({ message: "Role not found" })
    }
    res.json({ message: "Role deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all roles without pagination (for dropdowns)
export const getAllRolesNoPagination = async (req, res) => {
  try {
    const roles = await Role.find({ status: 1 }).sort({ name: 1 })
    res.json(roles)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// role.controller.js
export const deleteRoles = async (req, res) => {
  try {
    const { ids } = req.body; // mảng id
    await Role.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Roles deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getAllRolesNoPagination,
  deleteRoles,
}
