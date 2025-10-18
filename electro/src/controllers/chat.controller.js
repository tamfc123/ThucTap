// import ChatRoom from "../models/ChatRoom.js"
// // import ChatMessage from "../models/ChatMessage.js"

// // Get all chat rooms (Admin)
// export const getAllRooms = async (req, res) => {
//   try {
//     const { page = 1, size = 10 } = req.query

//     const skip = (page - 1) * size
//     const limit = Number.parseInt(size)

//     const rooms = await ChatRoom.find()
//       .populate("user", "username fullname email")
//       .populate("lastMessage")
//       .sort("-updatedAt")
//       .skip(skip)
//       .limit(limit)

//     const total = await ChatRoom.countDocuments()

//     res.json({
//       content: rooms,
//       totalElements: total,
//       totalPages: Math.ceil(total / size),
//       size: limit,
//       number: Number.parseInt(page) - 1,
//     })
//   } catch (error) {
//     res.status(500).json({ message: error.message })
//   }
// }

// // Get my chat rooms
// export const getMyRooms = async (req, res) => {
//   try {
//     const rooms = await ChatRoom.find({ user: req.user._id }).populate("lastMessage").sort("-updatedAt")

//     res.json(rooms)
//   } catch (error) {
//     res.status(500).json({ message: error.message })
//   }
// }

// // Get room messages
// export const getRoomMessages = async (req, res) => {
//   try {
//     const { page = 1, size = 50 } = req.query

//     const room = await ChatRoom.findById(req.params.roomId)
//     if (!room) {
//       return res.status(404).json({ message: "Chat room not found" })
//     }

//     // Check if user has access to this room
//     if (room.user.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
//       return res.status(403).json({ message: "Not authorized to view this chat room" })
//     }

//     const skip = (page - 1) * size
//     const limit = Number.parseInt(size)

//     const messages = await ChatMessage.find({ room: req.params.roomId })
//       .populate("sender", "username fullname")
//       .sort("createdAt")
//       .skip(skip)
//       .limit(limit)

//     const total = await ChatMessage.countDocuments({ room: req.params.roomId })

//     res.json({
//       content: messages,
//       totalElements: total,
//       totalPages: Math.ceil(total / size),
//       size: limit,
//       number: Number.parseInt(page) - 1,
//     })
//   } catch (error) {
//     res.status(500).json({ message: error.message })
//   }
// }

// // Create chat room
// export const createRoom = async (req, res) => {
//   try {
//     // Check if user already has a room
//     let room = await ChatRoom.findOne({ user: req.user._id })

//     if (room) {
//       return res.json(room)
//     }

//     room = new ChatRoom({
//       user: req.user._id,
//       name: `Chat with ${req.user.fullname || req.user.username}`,
//     })

//     await room.save()

//     const populatedRoom = await ChatRoom.findById(room._id).populate("user", "username fullname email")

//     res.status(201).json(populatedRoom)
//   } catch (error) {
//     res.status(400).json({ message: error.message })
//   }
// }

// export default { getAllRooms, getMyRooms, getRoomMessages, createRoom }