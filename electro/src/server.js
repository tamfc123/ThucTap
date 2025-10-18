import dotenv from "dotenv";
dotenv.config();
import express from "express"
import cors from "cors"
import { createServer } from "http"
import { Server } from "socket.io"
import connectDB from "./config/database.js"
import errorHandler from "./middleware/errorHandler.js"

// Import routes
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import roleRoutes from "./routes/role.routes.js"
import productRoutes from "./routes/product.routes.js"
import categoryRoutes from "./routes/category.routes.js"
import brandRoutes from "./routes/brand.routes.js"
import orderRoutes from "./routes/order.routes.js"
import reviewRoutes from "./routes/review.routes.js"
import addressRoutes from "./routes/address.routes.js"
import provinceRoutes from "./routes/province.routes.js"
import districtRoutes from "./routes/district.routes.js"
import wardRoutes from "./routes/ward.routes.js"
import warehouseRoutes from "./routes/warehouse.routes.js"
import supplierRoutes from "./routes/supplier.routes.js"
import employeeRoutes from "./routes/employee.routes.js"
import customerRoutes from "./routes/customer.routes.js"
import promotionRoutes from "./routes/promotion.routes.js"
import paymentMethodRoutes from "./routes/paymentMethod.routes.js"
import imageRoutes from "./routes/image.routes.js"
import chatRoutes from "./routes/chat.routes.js"
import statisticRoutes from "./routes/statistic.routes.js"
import officeRoutes from "./routes/office.routes.js"
import departmentRoutes from "./routes/department.routes.js"
import jobTypeRoutes from "./routes/job-type.routes.js"
import jobLevelRoutes from "./routes/job-level.routes.js"
import jobTitleRoutes from "./routes/job-title.routes.js"
import customerGroupRoutes from "./routes/customer-group.routes.js"
import customerStatusRoutes from "./routes/customer-status.routes.js"
import customerResourceRoutes from "./routes/customer-resource.routes.js"
import unitRoutes from "./routes/unit.routes.js"
import tagRoutes from "./routes/tag.routes.js"
import guaranteeRoutes from "./routes/guarantee.routes.js"
import propertyRoutes from "./routes/property.routes.js"
import specificationRoutes from "./routes/specification.routes.js"
import variantRoutes from "./routes/variant.routes.js"
import inventoryRoutes from "./routes/inventory.routes.js"
import purchaseOrderRoutes from "./routes/purchase-order.routes.js"
import destinationRoutes from "./routes/destination.routes.js"
import docketRoutes from "./routes/docket.routes.js"
import docketReasonRoutes from "./routes/docket-reason.routes.js"
import countRoutes from "./routes/count.routes.js"
import transferRoutes from "./routes/transfer.routes.js"
import waybillRoutes from "./routes/waybill.routes.js"
import rewardStrategyRoutes from "./routes/reward-strategy.routes.js"
import voucherRoutes from "./routes/voucher.routes.js"
import orderCancellationReasonRoutes from "./routes/order-cancellation-reason.routes.js"
import clientRoutes from "./routes/client.routes.js"

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors({
  origin: "http://localhost:3000", // FE origin
  credentials: true
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", express.static("uploads"))

// Socket.IO setup
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("join-room", (roomId) => {
    socket.join(roomId)
    console.log(`User ${socket.id} joined room ${roomId}`)
  })

  socket.on("send-message", (data) => {
    io.to(data.roomId).emit("receive-message", data)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

// Make io accessible to routes
app.set("io", io)

// API Routes - Admin
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/roles", roleRoutes)
app.use("/api/products", productRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/brands", brandRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/addresses", addressRoutes)
app.use("/api/provinces", provinceRoutes)
app.use("/api/districts", districtRoutes)
app.use("/api/wards", wardRoutes)
app.use("/api/warehouses", warehouseRoutes)
app.use("/api/suppliers", supplierRoutes)
app.use("/api/employees", employeeRoutes)
app.use("/api/offices", officeRoutes)
app.use("/api/departments", departmentRoutes)
app.use("/api/job-types", jobTypeRoutes)
app.use("/api/job-levels", jobLevelRoutes)
app.use("/api/job-titles", jobTitleRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/customer-groups", customerGroupRoutes)
app.use("/api/customer-status", customerStatusRoutes)
app.use("/api/customer-resources", customerResourceRoutes)
app.use("/api/units", unitRoutes)
app.use("/api/tags", tagRoutes)
app.use("/api/guarantees", guaranteeRoutes)
app.use("/api/properties", propertyRoutes)
app.use("/api/specifications", specificationRoutes)
app.use("/api/variants", variantRoutes)
app.use("/api", inventoryRoutes)
app.use("/api/purchase-orders", purchaseOrderRoutes)
app.use("/api/destinations", destinationRoutes)
app.use("/api/dockets", docketRoutes)
app.use("/api/docket-reasons", docketReasonRoutes)
app.use("/api/counts", countRoutes)
app.use("/api/transfers", transferRoutes)
app.use("/api/waybills", waybillRoutes)
app.use("/api/reward-strategies", rewardStrategyRoutes)
app.use("/api/vouchers", voucherRoutes)
app.use("/api/payment-methods", paymentMethodRoutes)
app.use("/api/promotions", promotionRoutes)
app.use("/api/rooms", chatRoutes)
app.use("/api/messages", chatRoutes)
app.use("/api/stats", statisticRoutes)
app.use("/api/order-cancellation-reasons", orderCancellationReasonRoutes)
app.use("/images", imageRoutes)

app.use("/client-api", clientRoutes)

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" })
})

// Error handling
app.use(errorHandler)

const PORT = process.env.PORT || 5000

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export { io }
