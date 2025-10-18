# Electro Backend API

Backend API for Electro E-commerce Platform built with Node.js, Express, MongoDB, and TypeScript.

## Features

- 🔐 **Authentication & Authorization**: JWT-based auth with role-based access control
- 🛍️ **E-commerce Core**: Products, Categories, Orders, Users management
- 📊 **Admin Dashboard**: Statistics and analytics
- 🛡️ **Security**: Rate limiting, CORS, Helmet, input validation
- 📁 **File Upload**: Image upload support
- 🗄️ **Database**: MongoDB with Mongoose ODM
- 📝 **API Documentation**: RESTful API design

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Language**: TypeScript
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, CORS, bcryptjs
- **Validation**: express-validator
- **File Upload**: Multer
- **Logging**: Morgan
- **Rate Limiting**: express-rate-limit

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get single user (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)
- `PUT /api/users/profile` - Update user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `PUT /api/orders/:id/cancel` - Cancel order

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users/stats` - Get user statistics
- `GET /api/admin/products/stats` - Get product statistics
- `GET /api/admin/orders/stats` - Get order statistics

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd electro-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/electro_db
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

## Database Models

### User
- Authentication and profile information
- Role-based access (admin, employee, customer)
- Address information

### Product
- Product details with variants
- Category and brand relationships
- Specifications and properties
- Image management

### Category
- Hierarchical category structure
- Parent-child relationships

### Order
- Order management with status tracking
- Payment information
- Shipping details

### Variant
- Product variants with inventory
- SKU management
- Price and cost tracking

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: express-validator for data validation
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers

## Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (when implemented)

### Project Structure
```
src/
├── config/          # Database and app configuration
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # MongoDB models
├── routes/          # API routes
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── server.ts        # Main application file
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.




