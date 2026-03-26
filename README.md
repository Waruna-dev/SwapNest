<p align="center">
  <img src="https://img.icons8.com/color/200/swap.png" alt="SwapNest Logo" width="150" />
</p>

<h1 align="center">🔄 SwapNest</h1>

<p align="center">
  <strong>A community-driven item swapping & volunteer coordination platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-active-brightgreen?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/license-ISC-blue?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/version-1.0.0-orange?style=flat-square" alt="Version" />
</p>

---

## 📸 Preview

<p align="center">
  <img src="https://via.placeholder.com/800x400/1a1a2e/e94560?text=SwapNest+%E2%80%93+Swap+Items+Easily" alt="SwapNest Banner" width="100%" />
</p>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧐 About

**SwapNest** is a full-stack web application that enables users to list items for swapping, request swaps with other users, schedule pickups, and coordinate volunteer activities. The platform supports both **item-for-item** and **swap-with-cash** transactions, making it a flexible community marketplace.

<p align="center">
  <img src="https://via.placeholder.com/700x300/16213e/0f3460?text=List+%E2%86%92+Swap+%E2%86%92+Pickup+%E2%86%92+Done!" alt="SwapNest Flow" width="80%" />
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **User Authentication** | Secure registration & login with JWT tokens and bcrypt password hashing |
| 📦 **Item Management** | Create, read, update, and delete item listings with image uploads via Cloudinary |
| 🔄 **Swap Requests** | Request item-for-item or swap-with-cash exchanges between users |
| 🚚 **Pickup Scheduling** | Schedule home pickups or drop-off at designated centers |
| 🤝 **Volunteer System** | Register volunteers with skills, availability, and document uploads |
| 📍 **Geolocation** | GeoJSON-based location support for items with 2dsphere indexing |
| 🖼️ **Image Uploads** | Multi-image upload support via Cloudinary and Multer |
| 🔍 **Text Search** | Full-text search on item titles and descriptions |

---

## 🛠️ Tech Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=nodejs,express,mongodb,js" alt="Tech Stack Icons" />
</p>

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js |
| **Framework** | Express.js v5 |
| **Database** | MongoDB with Mongoose v9 |
| **Authentication** | JWT + bcryptjs |
| **File Storage** | Cloudinary + Multer |
| **Validation** | express-validator |
| **Logging** | Morgan |

---

## 📁 Project Structure

```
SwapNest/
├── 📄 README.md
├── 🎨 3d-sphere/                    # 3D sphere assets
├── 🖥️ frontend/
│   ├── pickup.js                    # Pickup scheduling UI
│   └── Volunteer/
│       └── Volunteer.js             # Volunteer registration UI
│
└── ⚙️ backend/
    ├── server.js                    # Express app entry point
    ├── package.json                 # Dependencies & scripts
    ├── config/
    │   ├── db.js                    # MongoDB connection
    │   ├── cloudinary.js            # Cloudinary config
    │   └── Item.cloudinary.js       # Item-specific Cloudinary config
    ├── models/
    │   ├── User.js                  # User schema (auth, roles)
    │   ├── Item.js                  # Item schema (listings, geo)
    │   ├── Swap.js                  # Swap request schema
    │   ├── PickupModel.js           # Pickup scheduling schema
    │   └── VolunteerModel.js        # Volunteer registration schema
    ├── controllers/
    │   ├── authController.js        # Auth logic (register/login)
    │   ├── itemController.js        # Item CRUD operations
    │   ├── swapController.js        # Swap request handling
    │   ├── PickupController.js      # Pickup management
    │   └── VolunteerController.js   # Volunteer management
    ├── routes/
    │   ├── userRoutes.js            # /api/users
    │   ├── itemRoutes.js            # /api/items
    │   ├── swapRoutes.js            # /api/swaps
    │   ├── PickupRoutes.js          # /api/pickups
    │   └── VolunteerRoutes.js       # /api/volunteers
    ├── middlewares/
    │   ├── authMiddleware.js        # JWT verification
    │   ├── errorMiddleware.js       # Global error handler
    │   ├── validation.js            # Request validation rules
    │   ├── upload.js                # Multer file upload config
    │   ├── item-upload.js           # Item image upload config
    │   ├── pickupmiddlewares.js     # Pickup-specific middleware
    │   └── volunteermiddlewares.js  # Volunteer-specific middleware
    ├── utils/
    │   └── item-cloudinaryUpload.js # Cloudinary upload helper
    └── uploads/
        └── swaps/                   # Local swap image storage
```

---

## 🚀 Getting Started

### Prerequisites

<p align="center">
  <img src="https://img.shields.io/badge/Node.js->=18.0.0-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas%20or%20Local-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
</p>

- **Node.js** v18 or higher
- **MongoDB** (Atlas cloud or local instance)
- **Cloudinary** account (for image uploads)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/SwapNest.git
cd SwapNest

# 2. Install backend dependencies
cd backend
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env with your configuration (see Environment Variables section)

# 4. Start the development server
npm run dev
```

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Dev** | `npm run dev` | Start with nodemon (hot-reload) |
| **Start** | `npm start` | Start production server |

---

## 🔌 API Endpoints

### 👤 Users — `/api/users`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users/register` | Register a new user |
| `POST` | `/api/users/login` | Login & receive JWT token |

### 📦 Items — `/api/items`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/items` | Get all items |
| `GET` | `/api/items/:id` | Get item by ID |
| `POST` | `/api/items` | Create a new item listing |
| `PUT` | `/api/items/:id` | Update an item |
| `DELETE` | `/api/items/:id` | Delete an item |

### 🔄 Swaps — `/api/swaps`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/swaps` | Get all swap requests |
| `POST` | `/api/swaps` | Create a swap request |
| `PUT` | `/api/swaps/:id` | Update swap status |
| `DELETE` | `/api/swaps/:id` | Cancel a swap request |

### 🚚 Pickups — `/api/pickups`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/pickups` | Get all pickups |
| `POST` | `/api/pickups` | Schedule a pickup |
| `PUT` | `/api/pickups/:id` | Update pickup details |
| `DELETE` | `/api/pickups/:id` | Cancel a pickup |

### 🤝 Volunteers — `/api/volunteers`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/volunteers` | Get all volunteers |
| `POST` | `/api/volunteers` | Register as a volunteer |
| `PUT` | `/api/volunteers/:id` | Update volunteer info |
| `DELETE` | `/api/volunteers/:id` | Remove a volunteer |

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
# Server
PORT=5000

# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/swapnest

# JWT
JWT_SECRET=your_jwt_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m "Add amazing feature"

# 4. Push to the branch
git push origin feature/amazing-feature

# 5. Open a Pull Request
```

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">
  <img src="https://img.icons8.com/fluency/48/handshake.png" alt="Handshake" width="40" />
  <br />
  <strong>Built with ❤️ by the SwapNest Team</strong>
  <br />
  <sub>Swap smarter. Live greener. 🌱</sub>
</p>
