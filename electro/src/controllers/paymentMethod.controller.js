import PaymentMethod from "../models/PaymentMethod.js"

// Get all payment methods
export const getAll = async (req, res) => {
  try {
    const { page = 1, size = 10, sort = "createdAt", search } = req.query

    const query = {}
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { code: { $regex: search, $options: "i" } }]
    }

    const paymentMethods = await PaymentMethod.find(query)
      .sort(sort)
      .limit(size * 1)
      .skip((page - 1) * size)

    const total = await PaymentMethod.countDocuments(query)

    res.json({
      content: paymentMethods,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size: Number.parseInt(size),
      number: Number.parseInt(page) - 1,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get payment method by ID
export const getById = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findById(req.params.id)
    if (!paymentMethod) {
      return res.status(404).json({ message: "Payment method not found" })
    }
    res.json(paymentMethod)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create payment method
export const create = async (req, res) => {
  try {
    const paymentMethod = new PaymentMethod(req.body)
    const savedPaymentMethod = await paymentMethod.save()
    res.status(201).json(savedPaymentMethod)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Update payment method
export const update = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!paymentMethod) {
      return res.status(404).json({ message: "Payment method not found" })
    }
    res.json(paymentMethod)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Delete multiple payment methods
export const deleteMany = async (req, res) => {
  try {
    const { ids } = req.body
    await PaymentMethod.deleteMany({ _id: { $in: ids } })
    res.json({ message: "Payment methods deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export default {
  getAll,
  getById,
  create,
  update,
  deleteMany,
}