# 🌍 SwapNest

## ♻️ A Web-Based Local Thrift & Swap Platform for Sustainable Cities

---
<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/408aa262-f00d-44b7-a1f7-29afb39f3ec2" />

## 🌆 Project Theme

**Sustainable Cities and Communities **

SwapNest is designed to promote sustainable urban living by encouraging reuse, reducing waste, and strengthening local community connections through a digital platform.

---

## 💡 About SwapNest

SwapNest is a full-stack web application that allows users to:

* 📦 List secondhand items
* 🔄 Swap goods with other users
* 💰 Sell affordable thrift products
* 🚚 Request local pickup services
* 🙋 Connect with volunteers

Our goal is to reduce landfill waste and support a circular economy within local communities.

---

## 🎯 Problem Statement

Modern cities face increasing environmental challenges:

* Excessive textile and electronic waste
* Usable goods being discarded
* Rising cost of new products
* Lack of organized local reuse platforms

These issues contribute to pollution and unsustainable consumption.

---

## 🚀 Our Solution

SwapNest provides a centralized digital platform where communities can exchange goods instead of discarding them.

We promote the model:

Buy → Use → Reuse → Swap → Extend Product Life → Reduce Waste

Instead of:

Buy → Use → Throw Away

---

## 🛠 Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication
* Multer
* Cloudinary

### Frontend

* HTML
* CSS
* JavaScript

---

## 🔑 Key Features

* Secure User Authentication
* Item Listing & Management
* Image Upload (Cloudinary Integration)
* Swap Request System
* Pickup Scheduling System
* Volunteer Management
* Location-Based Search
* Global Error Handling & Middleware Validation

---

## 📁 Project Structure

```
SwapNest/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   └── server.js
│
├── frontend/
│   ├── pickup.js
│   └── Volunteer/
│
└── README.md
```

---

## ⚙️ Installation Guide

### 1️⃣ Clone Repository

```
git clone https://github.com/your-username/swapnest.git
cd swapnest/backend
```

### 2️⃣ Install Dependencies

```
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file inside `/backend`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4️⃣ Run the Server

```
npm run dev
```

Server runs at:

```
http://localhost:5000
```

---

## 🌱 Sustainability Impact

### Environmental Impact

* Reduces landfill waste
* Lowers carbon footprint
* Encourages circular economy

### Social Impact

* Makes goods affordable
* Builds stronger local communities
* Promotes sharing culture

---

## 🏆 Vision

"To build sustainable communities by transforming waste into opportunity through technology."

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Submit a pull request

---

## 📜 License

Add your preferred license (MIT recommended).

---

### ⭐ Support

If you like this project, consider giving it a star on GitHub!
