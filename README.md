# 🎨 StyleDecor - Backend Server

Event decoration booking platform API built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create .env file
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/styledecor
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=your-stripe-key
CLIENT_URL=http://localhost:5173

# Seed database
npm run seed

# Run server
npm run dev
```

## 📦 Tech Stack

- Node.js + Express
- MongoDB
- JWT Authentication
- Stripe Payments
- Bcrypt (password hashing)

## 🔑 Default Credentials

**Admin:** admin@styledecor.com / Admin@123  
**Decorator:** decorator@styledecor.com / Decorator@123

## 📡 API Endpoints

**Base URL:** `http://localhost:5000/api`

### Authentication
- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user

### Services
- `GET /services` - Get all services (filters: search, category, price)
- `GET /services/:id` - Get service by ID
- `POST /services` - Create service (Admin)
- `PUT /services/:id` - Update service (Admin)
- `DELETE /services/:id` - Delete service (Admin)

### Bookings
- `POST /bookings` - Create booking (User)
- `GET /bookings/my-bookings` - Get user bookings
- `GET /bookings/all` - Get all bookings (Admin)

### Decorators
- `GET /decorators` - Get all decorators
- `GET /decorators/top?limit=6` - Get top decorators

### Users
- `GET /users/profile` - Get profile
- `PUT /users/profile` - Update profile
- `GET /users/all` - Get all users (Admin)

### Payments
- `POST /payments/create-payment-intent` - Create payment
- `POST /payments/confirm-payment` - Confirm payment
- `GET /payments/history` - Get payment history

## 🗄️ MongoDB Setup

### Local MongoDB
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### MongoDB Atlas (Cloud)
1. Create cluster at https://cloud.mongodb.com/
2. Get connection string
3. Update `MONGODB_URI` in .env

## 🐛 Troubleshooting

**MongoDB connection error:**
```bash
# Check if MongoDB is running
mongosh

# Or use MongoDB Atlas
```

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

**Module not found:**
```bash
# Reinstall dependencies
npm install
```

## 📁 Project Structure

```
styledecor-server/
├── config/
│   └── db.js                 # MongoDB connection
├── middleware/
│   └── authMiddleware.js     # JWT verification
├── routes/
│   ├── auth.routes.js
│   ├── service.routes.js
│   ├── bookings.routes.js
│   ├── decorators.routes.js
│   ├── users.routes.js
│   └── payment.routes.js
├── .env                      # Environment variables
├── index.js                  # Main server file
└── seedAdmin.js              # Database seeder
```

## 📝 Scripts

```bash
npm start          # Production mode
npm run dev        # Development mode (auto-reload)
npm run seed       # Seed database
```

---

**Developer:** Redwan Shahriar | **License:** ISC