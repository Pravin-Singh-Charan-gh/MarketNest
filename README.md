# MarketNest 🛍️

A Mini Fashion Marketplace built with the MERN stack where Brands can manage products and Customers can browse and explore.

## 🔗 Links

- **Frontend:** https://marketnest-chi.vercel.app
- **Backend:** https://marketnest-api-4ox8.onrender.com
- **GitHub:** https://github.com/Pravin-Singh-Charan-gh/MarketNest

> ⚠️ **Note:** The backend is hosted on Render's free tier which spins down 
> after 15 minutes of inactivity. The first request may take 30-60 seconds 
> to respond while the server wakes up. Please wait and try again if you 
> get an error on first load.

---

## 🏗️ Architecture

MarketNest follows a classic client-server architecture:

- **Frontend (React)** — deployed on Vercel, communicates with backend via REST API
- **Backend (Node/Express)** — deployed on Render, handles business logic and auth
- **Database (MongoDB Atlas)** — cloud-hosted, stores users and products
- **Cloudinary** — handles image uploads and storage
```
Client (React + Vite)
      ↓ HTTP requests (Axios)
Server (Express + Node.js)
      ↓ Mongoose ODM
MongoDB Atlas (Cloud Database)
      ↓ Cloudinary SDK
Cloudinary (Image Storage)
```

---

## 🔐 Authentication Flow

MarketNest uses a dual-token JWT strategy:

1. **Signup** — User registers with name, email, password and role (brand/customer). Password is hashed with bcrypt before saving.

2. **Login** — Server verifies credentials, generates two tokens:
   - **Access Token** (15min expiry) — sent in response body, stored in memory
   - **Refresh Token** (7 days expiry) — sent as httpOnly cookie, stored in DB

3. **Authenticated Request** — Client sends `Authorization: Bearer <accessToken>` header on every request. `authMiddleware` verifies the token and attaches `req.user = { id, role }`.

4. **Token Refresh** — When access token expires (401 response), Axios interceptor automatically calls `/api/auth/refresh-token`, gets a new access token, and retries the original request — seamlessly, without the user noticing.

5. **Logout** — Refresh token is cleared from DB and cookie is cleared. Even if someone has the old token, it no longer works.

---

## 📁 Folder Structure
```
marketnest/
├── server/                        # Node/Express Backend
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── cloudinary.js          # Cloudinary + Multer setup
│   ├── controllers/
│   │   ├── authController.js      # Signup, Login, Logout, Refresh
│   │   ├── productController.js   # CRUD + image upload
│   │   └── dashboardController.js # Brand stats
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification
│   │   └── roleMiddleware.js      # Role-based access control
│   ├── models/
│   │   ├── User.js                # User schema with bcrypt hook
│   │   └── Product.js             # Product schema with soft delete
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── dashboardRoutes.js
│   ├── utils/
│   │   └── generateTokens.js      # Access + refresh token generators
│   └── index.js                   # Express app entry point
│
└── client/                        # React Frontend
    ├── src/
    │   ├── api/
    │   │   └── axios.js           # Axios instance with interceptors
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProductCard.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Marketplace.jsx
    │   │   ├── ProductDetail.jsx
    │   │   └── BrandDashboard.jsx
    │   └── App.jsx
    └── vercel.json                # SPA routing fix for Vercel
```

---

## 🔒 Security Decisions

### Password Hashing
Passwords are hashed using **bcrypt** with salt rounds of 10 before being stored. Plain text passwords are never saved to the database.

### JWT Dual Token Strategy
- **Short-lived access tokens (15min)** minimize damage if a token is stolen
- **Long-lived refresh tokens (7 days)** stored in httpOnly cookies prevent JavaScript from ever reading them, protecting against XSS attacks

### Refresh Token Rotation
Every time a refresh token is used, a new one is issued and the old one is invalidated in the database. This prevents token reuse attacks.

### Refresh Token Revocation
Refresh tokens are stored in the database. On logout, the token is deleted from DB, making it permanently invalid even before expiry.

### Role-Based Access Control
Every protected route runs through two middleware layers:
1. `authMiddleware` — verifies the JWT and attaches user info
2. `requireRole('brand')` — checks the user's role before allowing access

### Ownership Enforcement
Before any product edit or delete, the controller verifies `product.owner === req.user.id`. This prevents IDOR (Insecure Direct Object Reference) attacks where one brand could modify another brand's products.

### Soft Delete
Products are never permanently deleted. `isDeleted: true` flag is set instead, allowing data recovery and audit trails.

### Environment Variables
All secrets (JWT keys, DB URI, Cloudinary credentials) are stored in `.env` files and never committed to GitHub.

### CORS
Backend only accepts requests from whitelisted frontend origins, preventing unauthorized domains from calling the API.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (Access + Refresh Tokens) |
| Image Storage | Cloudinary |
| Deployment | Vercel (frontend), Render (backend) |
| Security | bcryptjs, httpOnly cookies, CORS |

---

## 🚀 Local Setup

### Prerequisites
- Node.js
- MongoDB running locally
- Cloudinary account

### Backend
```bash
cd server
npm install
# Create .env file with required variables (see .env.example)
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

### Environment Variables (server/.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/marketnest
JWT_ACCESS_SECRET=my_secret
JWT_REFRESH_SECRET=my_secret
CLOUDINARY_CLOUD_NAME=my_cloud_name
CLOUDINARY_API_KEY=my_api_key
CLOUDINARY_API_SECRET=my_api_secret
CLIENT_URL=http://localhost:5173
```

---

## 🤖 AI Tool Usage

Claude (Anthropic) was used during development as a coding assistant for:
- Debugging middleware and async issues
- Cloudinary integration troubleshooting
- CORS configuration for production deployment

All code was reviewed, understood, and typed/modified manually. The architecture decisions, schema design, and security strategy were planned and understood by the developer.

---

## 👤 Author

**Pravin Singh**  
[LinkedIn](https://www.linkedin.com/in/pravin07/)  