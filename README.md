# 🎨 StyleDecor - Backend Server

Event decoration booking platform API built with Node.js, Express, and MongoDB.

[![Live Server](https://img.shields.io/badge/Live-Server-success?style=for-the-badge)](https://styledecor-server17.netlify.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/redwanshahriarshubho)

---

## 🌐 Live Links

- **Live Server:** https://styledecor-server17.netlify.app/
- **API Base URL:** https://styledecor-server17.netlify.app/api
- **GitHub Repository:** [Add your GitHub repo URL here]

---

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

---

## 📦 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication
- **Bcrypt.js** - Password hashing
- **Stripe** - Payment processing
- **CORS** - Cross-origin resource sharing

---

## 🔑 Default Credentials

**Admin Account:**
- Email: `admin@styledecor.com`
- Password: `Admin@123`

**Decorator Account:**
- Email: `decorator@styledecor.com`
- Password: `Decorator@123`

⚠️ **Note:** Change these credentials in production!

---

## 📡 API Endpoints

**Base URL:** `http://localhost:5000/api` (Local)  
**Live URL:** `https://styledecor-server17.netlify.app/api`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user (Protected)

### Services
- `GET /services` - Get all services (filters: search, category, price, pagination)
- `GET /services/:id` - Get service by ID
- `GET /services/meta/categories` - Get all service categories
- `POST /services` - Create service (Admin only)
- `PUT /services/:id` - Update service (Admin only)
- `DELETE /services/:id` - Delete service (Admin only)

### Bookings
- `POST /bookings` - Create booking (User)
- `GET /bookings/my-bookings` - Get user's bookings (Protected)
- `GET /bookings/all` - Get all bookings (Admin only)
- `PATCH /bookings/update-status/:id` - Update booking status (Decorator/Admin)

### Decorators
- `GET /decorators` - Get all active decorators
- `GET /decorators/top?limit=6` - Get top-rated decorators

### Users
- `GET /users/profile` - Get user profile (Protected)
- `PUT /users/profile` - Update profile (Protected)
- `GET /users/all` - Get all users (Admin only)
- `PUT /users/:id/make-decorator` - Promote user to decorator (Admin only)
- `PUT /users/:id/toggle-status` - Enable/disable user (Admin only)

### Payments
- `POST /payments/create-payment-intent` - Create Stripe payment intent (Protected)
- `POST /payments/confirm-payment` - Confirm payment (Protected)
- `GET /payments/history` - Get user's payment history (Protected)
- `GET /payments/all` - Get all payments (Admin only)
- `GET /payments/:id` - Get payment by ID (Protected)

---

## 🗄️ MongoDB Setup

### Option 1: Local MongoDB
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Option 2: MongoDB Atlas (Cloud)
1. Go to https://cloud.mongodb.com/
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/styledecor?retryWrites=true&w=majority
```

---

## 🐛 Troubleshooting

### MongoDB connection error
```bash
# Check if MongoDB is running locally
mongosh

# Or use MongoDB Atlas (cloud)
```

### Port already in use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Module not found
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### JWT Secret Error
Make sure `.env` file has:
```env
JWT_SECRET=your-super-secret-key-here
```

---

## 📁 Project Structure

```
styledecor-server/
├── config/
│   └── db.js                 # MongoDB connection
├── middleware/
│   └── authMiddleware.js     # JWT verification & role checks
├── routes/
│   ├── auth.routes.js        # Authentication endpoints
│   ├── service.routes.js     # Service CRUD operations
│   ├── bookings.routes.js    # Booking management
│   ├── decorators.routes.js  # Decorator listings
│   ├── users.routes.js       # User management
│   └── payment.routes.js     # Stripe payment integration
├── .env                      # Environment variables
├── .gitignore               # Git ignore file
├── index.js                  # Main server file
├── package.json              # Dependencies & scripts
└── seedAdmin.js              # Database seeder
```

---

## 📝 NPM Packages Used

### Core Dependencies
- `express` - Web framework
- `mongodb` - MongoDB driver
- `dotenv` - Environment variables
- `cors` - Cross-origin resource sharing
- `cookie-parser` - Cookie handling

### Authentication & Security
- `jsonwebtoken` - JWT token generation/verification
- `bcryptjs` - Password hashing

### Payment
- `stripe` - Payment processing

### Development
- `nodemon` - Auto-restart server on changes

---

## 📝 Available Scripts

```bash
npm start          # Production mode
npm run dev        # Development mode (auto-reload with nodemon)
npm run seed       # Seed database with admin, decorator, and services
```

---

## 🚀 Deployment

This project is deployed on **Netlify**.

### Deploy Your Own

#### Option 1: Netlify
1. Build the project (if needed)
2. Connect your GitHub repository
3. Set environment variables in Netlify dashboard
4. Deploy!

#### Option 2: Render
1. Create new Web Service
2. Connect GitHub repo
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables

#### Option 3: Railway
1. Create new project
2. Connect GitHub
3. Add environment variables
4. Deploy automatically

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
STRIPE_SECRET_KEY=your_stripe_secret_key
CLIENT_URL=https://your-frontend-url.vercel.app
```

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT token authentication
- ✅ Role-based access control (User, Decorator, Admin)
- ✅ Protected routes with middleware
- ✅ CORS configured for specific origins
- ✅ Environment variables for sensitive data
- ✅ Input validation
- ✅ Secure payment processing with Stripe

---

## 👨‍💻 Developer

**Redwan Shahriar**  
Full Stack Web Developer  
Email: redwanshahriar@example.com  
GitHub: [@redwanshahriarshubho](https://github.com/redwanshahriarshubho)

---

## 📄 License

This project was created as part of a programming assessment.  
**License:** ISC

---

## 🙏 Acknowledgments

- MongoDB for database
- Express.js for backend framework
- Stripe for payment processing
- JWT for authentication
- Node.js community

---

**Developed with ❤️ by Redwan Shahriar**