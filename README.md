# SwapNest

**Classification:** Public-SLIIT

SwapNest is a full-stack item exchange platform with user authentication, item listings, swap workflows, volunteer registration, pickup scheduling, donation center management, contact submissions, and in-app notifications.

## 1. System Overview

### Core modules
- Authentication and user profile management
- Item listing and marketplace discovery
- Swap request lifecycle (pending, accepted, rejected, completed, cancelled)
- Notifications for swap events
- Pickup / drop-off booking
- Center (location) management
- Volunteer management
- Contact us form with optional attachment
- Admin authentication and user administration

### Tech stack
- Frontend: React 19 + Vite + Axios + React Router
- Backend: Node.js + Express 5 + Mongoose
- Database: MongoDB
- Media: Cloudinary (items, swaps, profile images)
- Auth: JWT Bearer tokens
- Email: Resend (password reset email)

## 2. Repository Structure

```text
SwapNest/
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- middlewares/
|   |-- models/
|   |-- routes/
|   |-- utils/
|   |-- server.js
|   |-- seedAdmin.js
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- services/
|   |   `-- App.jsx
|   `-- package.json
`-- README.md
```

## 3. Setup Instructions (Step-by-Step)

### 3.1 Prerequisites
- Node.js 18+
- npm 9+
- MongoDB (Atlas or local)
- Cloudinary account
- Resend account (for reset emails)

### 3.2 Clone project
```bash
git clone <your-repository-url>
cd SwapNest
```

### 3.3 Install dependencies
Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd ../frontend
npm install
```

### 3.4 Configure environment variables
Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<db>
JWT_SECRET=replace_with_secure_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RESEND_API_KEY=your_resend_api_key
NODE_ENV=development
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Notes:
- Frontend Google OAuth client id is currently hardcoded in `frontend/src/main.jsx`.
- Password reset link uses `http://localhost:5173` when `NODE_ENV != production`.

### 3.5 Optional: seed admin account
From `backend/`:
```bash
npm run seed:admin
```
Creates:
- Email: `curator@swapnest.com`
- Password: `AdminPassword123!`

### 3.6 Run development servers
Terminal 1 (backend):
```bash
cd backend
npm run dev
```

Terminal 2 (frontend):
```bash
cd frontend
npm run dev
```

### 3.7 Default URLs
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Health check: `GET http://localhost:5000/`

## 4. Authentication

### JWT format
Protected endpoints require:
```http
Authorization: Bearer <token>
```

### Roles
- `user`
- `volunteer`
- `admin`

### Auth routes that are protected in current code
- `GET /api/users/me`
- `PUT /api/users/profile`
- `PUT /api/users/password`
- `POST /api/users/logout`
- `DELETE /api/users/:id` (admin or owner)
- `GET /api/admin/users`
- `PUT /api/admin/users/:id`
- `DELETE /api/admin/users/:id`

## 5. API Endpoint Documentation

Base URL: `http://localhost:5000/api`

Response pattern varies by module:
- Some return raw documents
- Some return `{ success, message, data }`

---

## 5.1 User Auth and Profile (`/api/users`)

### 1) Register user
- Method: `POST`
- Endpoint: `/users/register`
- Auth: None
- Body (JSON):
```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "Password123!",
  "role": "user"
}
```
- Success `201`:
```json
{
  "_id": "...",
  "username": "john",
  "email": "john@example.com",
  "role": "user",
  "token": "<jwt>"
}
```

### 2) Login user
- Method: `POST`
- Endpoint: `/users/login`
- Auth: None
- Body:
```json
{ "email": "john@example.com", "password": "Password123!" }
```
- Success `200`: user object + `token`
- Error `403`: admin attempted standard portal login

### 3) Google auth
- Method: `POST`
- Endpoint: `/users/google`
- Auth: None
- Body:
```json
{ "googleAccessToken": "<google_oauth_access_token>" }
```
- Success `200`: user object + `token`

### 4) Forgot password
- Method: `POST`
- Endpoint: `/users/forgot-password`
- Auth: None
- Body:
```json
{ "email": "john@example.com" }
```
- Success `200`:
```json
{ "message": "Token sent to email!" }
```
(or generic success if email not found)

### 5) Reset password
- Method: `POST`
- Endpoint: `/users/reset-password/:token`
- Auth: None
- Body:
```json
{ "password": "NewPassword123!" }
```
- Success `200`:
```json
{ "message": "Password reset successful" }
```

### 6) Get current user
- Method: `GET`
- Endpoint: `/users/me`
- Auth: Bearer token
- Success `200`: authenticated user object (without password)

### 7) Update profile
- Method: `PUT`
- Endpoint: `/users/profile`
- Auth: Bearer token
- Content-Type: `multipart/form-data`
- Fields:
  - `username` (optional)
  - `email` (optional)
  - `bio` (optional)
  - `profileImage` (optional file)
- Success `200`: updated user object

### 8) Update password
- Method: `PUT`
- Endpoint: `/users/password`
- Auth: Bearer token
- Body:
```json
{
  "oldPassword": "Password123!",
  "newPassword": "Password456!"
}
```
- Success `200`:
```json
{ "message": "Password updated successfully" }
```

### 9) Logout
- Method: `POST`
- Endpoint: `/users/logout`
- Auth: Bearer token
- Success `200`:
```json
{ "message": "Successfully logged out." }
```

### 10) Delete user (admin or owner)
- Method: `DELETE`
- Endpoint: `/users/:id`
- Auth: Bearer token (admin or same user)
- Success `200`:
```json
{
  "message": "User account deleted successfully",
  "deletedUserId": "..."
}
```

---

## 5.2 Admin (`/api/admin`)

### 1) Admin login
- Method: `POST`
- Endpoint: `/admin/login`
- Auth: None
- Body:
```json
{ "email": "curator@swapnest.com", "password": "AdminPassword123!" }
```
- Success `200`: admin + JWT

### 2) Get all users
- Method: `GET`
- Endpoint: `/admin/users`
- Auth: Bearer token + admin role
- Success `200`: array of users (without password)

### 3) Update user by admin
- Method: `PUT`
- Endpoint: `/admin/users/:id`
- Auth: Bearer token + admin role
- Body:
```json
{
  "username": "newName",
  "email": "new@example.com",
  "role": "user",
  "password": "OptionalNewPassword"
}
```
- Success `200`: updated user (no password)

### 4) Delete user by admin
- Method: `DELETE`
- Endpoint: `/admin/users/:id`
- Auth: Bearer token + admin role
- Success `200`:
```json
{ "message": "User removed successfully" }
```

---

## 5.3 Items (`/api/items`)

### 1) Create item
- Method: `POST`
- Endpoint: `/items`
- Auth: None (no middleware in current code)
- Content-Type: `multipart/form-data`
- Fields:
  - Required: `title`, `category`, `mode`, `ownerId`
  - Optional: `description`, `price`, `condition`, `contact`, `lat`, `lng`
  - Images: `images` (up to 5, max 5MB each)
- Alternative: send `images` JSON array in body
- Success `201`: created item document

Example cURL:
```bash
curl -X POST http://localhost:5000/api/items \
  -F "title=Gaming Chair" \
  -F "category=Furniture" \
  -F "mode=SWAP" \
  -F "ownerId=67f..." \
  -F "price=15000" \
  -F "images=@chair.jpg"
```

### 2) Get items list
- Method: `GET`
- Endpoint: `/items`
- Auth: None
- Query params:
  - `page`, `limit`
  - `q` (text search)
  - `category`, `mode`, `condition`
  - `minPrice`, `maxPrice`
  - `sort` = `newest | price_asc | price_desc | popular | relevance`
  - `includeInactive=true|false`
  - `includeHidden=true|false`
- Success `200`:
```json
{
  "items": [],
  "page": 1,
  "limit": 12,
  "totalItems": 0,
  "totalPages": 0
}
```

### 3) Get nearby items
- Method: `GET`
- Endpoint: `/items/nearby`
- Auth: None
- Query: `lat`, `lng` required; optional `distance`, filters, pagination

### 4) Get title suggestions
- Method: `GET`
- Endpoint: `/items/suggestions`
- Auth: None
- Query: `q` required, optional `limit`
- Success:
```json
{ "suggestions": ["Chair", "Chair Cover"] }
```


### 5) Get item by id
- Method: `GET`
- Endpoint: `/items/:id`
- Auth: None
- Query: `incViews=true|false`

### 6) Get similar items
- Method: `GET`
- Endpoint: `/items/:id/similar`
- Auth: None
- Query: `limit`

### 7) Update item
- Method: `PUT`
- Endpoint: `/items/:id`
- Auth: None (no middleware in current code)
- Content-Type: `multipart/form-data`
- Supports:
  - field updates
  - image add/replace
  - `replaceImages=true|false`
  - `keepImagePublicIds` array
  - `coverIndex`

### 8) Delete item
- Method: `DELETE`
- Endpoint: `/items/:id`
- Auth: None
- Query: `soft=true` for soft delete; otherwise hard delete

---

## 5.4 Swaps (`/api/swaps`)

### 1) Create swap request
- Method: `POST`
- Endpoint: `/swaps`
- Auth: None (no middleware in current code)
- Content-Type: `multipart/form-data`
- Files: `photos` up to 5 images
- Required body fields:
  - `itemId`, `requesterId`, `requesterName`, `swapType`, `agreementAccepted`
- Optional:
  - `offeredItem`, `cashDetails`, `messageToOwner`
- `swapType` values:
  - `item-for-item`
  - `swap-with-cash`
- Success `201`:
```json
{
  "success": true,
  "message": "Swap request created",
  "data": { "_id": "...", "status": "pending" }
}
```

### 2) Update swap request
- Method: `PUT`
- Endpoint: `/swaps/:id`
- Auth: None
- Rule: only requester can update and only when status is `pending`

### 3) Update swap photos
- Method: `PUT`
- Endpoint: `/swaps/:id/photos`
- Auth: None
- Multipart fields:
  - `requesterId`
  - `removePhotoIndices` (JSON array string)
  - `photos` (new files)

### 4) Get all swaps
- Method: `GET`
- Endpoint: `/swaps/all`
- Auth: None (intended admin, but currently open)
- Query: `status`, `swapType`, `sort=oldest|status`

### 5) Get user swaps
- Method: `GET`
- Endpoint: `/swaps/user/:userId`
- Auth: None

### 6) Get pending requests for owner
- Method: `GET`
- Endpoint: `/swaps/pending/:ownerId`
- Auth: None

### 7) Get swap by id
- Method: `GET`
- Endpoint: `/swaps/:id`
- Auth: None

### 8) Get swaps by item
- Method: `GET`
- Endpoint: `/swaps/by-item?itemId=<id>&status=<status>`
- Auth: None
- Note: route is currently declared after `/:id`; this may require reordering if it conflicts.

### 9) Update swap status
- Method: `PUT`
- Endpoint: `/swaps/:id/status`
- Auth: None
- Body:
```json
{ "status": "accepted", "notes": "optional" }
```
- Allowed status: `accepted`, `rejected`, `completed`, `cancelled`

### 10) Cancel swap request
- Method: `PUT`
- Endpoint: `/swaps/:id/cancel`
- Auth: None
- Rule: only `pending` swaps can be cancelled

### 11) Delete swap
- Method: `DELETE`
- Endpoint: `/swaps/:id`
- Auth: None
- Also deletes associated Cloudinary photos

### 12) Request completion confirmation
- Method: `POST`
- Endpoint: `/swaps/:id/complete`
- Auth: None
- Body:
```json
{ "userId": "...", "userRole": "requester" }
```
- `userRole`: `requester | owner`

### 13) Get completion status
- Method: `GET`
- Endpoint: `/swaps/:id/completion-status`
- Auth: None
- Success:
```json
{
  "success": true,
  "data": {
    "requesterConfirmed": true,
    "ownerConfirmed": false,
    "bothConfirmed": false,
    "completionRequestedAt": "...",
    "bothConfirmedAt": null
  }
}
```

---

## 5.5 Notifications (`/api/notifications`)

### 1) Get user notifications
- Method: `GET`
- Endpoint: `/notifications/user/:userId`
- Auth: None
- Query: `limit`, `unreadOnly=true|false`

### 2) Get unread count
- Method: `GET`
- Endpoint: `/notifications/user/:userId/count`
- Auth: None

### 3) Mark one as read
- Method: `PUT`
- Endpoint: `/notifications/:id/read`
- Auth: None

### 4) Mark all as read
- Method: `PUT`
- Endpoint: `/notifications/user/:userId/read-all`
- Auth: None

### 5) Delete notification
- Method: `DELETE`
- Endpoint: `/notifications/:id`
- Auth: None

---

## 5.6 Pickups (`/api/pickups`)

### 1) Create pickup/center booking
- Method: `POST`
- Endpoint: `/pickups`
- Auth: None
- Body:
```json
{
  "name": "Jane",
  "phone": "0771234567",
  "method": "pickup",
  "address": "No 10, Main Street",
  "date": "2026-04-12T10:00:00.000Z",
  "notes": "Ring the bell"
}
```
- `method` values: `pickup | center`
- If `method=pickup`, `address` required
- If `method=center`, `center` required

### 2) Get all pickups
- Method: `GET`
- Endpoint: `/pickups`
- Auth: None (intended admin, but currently open)
- Query: `method`, `status`, `page`, `limit`

### 3) Get pickup by id
- Method: `GET`
- Endpoint: `/pickups/:id`
- Auth: None

### 4) Update pickup status
- Method: `PUT`
- Endpoint: `/pickups/:id/status`
- Auth: None (intended admin, but currently open)
- Body:
```json
{ "status": "confirmed" }
```
- Allowed status: `pending | confirmed | completed | cancelled`

### 5) Delete pickup
- Method: `DELETE`
- Endpoint: `/pickups/:id`
- Auth: None (intended admin, but currently open)

---

## 5.7 Centers (`/api/centers`)

### 1) Get all centers
- Method: `GET`
- Endpoint: `/centers`
- Auth: None
- Query: `district`, `city`, `status`, `search`

### 2) Create center
- Method: `POST`
- Endpoint: `/centers`
- Auth: None
- Body (required fields):
```json
{
  "centerName": "Colombo Hub",
  "centerCode": "CMB001",
  "district": "Colombo",
  "city": "Colombo",
  "address": "No 1, Example Rd",
  "contactNumber": "0111234567",
  "email": "hub@example.com",
  "managerName": "Manager Name",
  "managerContact": "0771234567",
  "capacity": 100
}
```

### 3) Get center by id
- Method: `GET`
- Endpoint: `/centers/:id`
- Auth: None

### 4) Full update center
- Method: `PUT`
- Endpoint: `/centers/:id`
- Auth: None

### 5) Partial update center
- Method: `PATCH`
- Endpoint: `/centers/:id`
- Auth: None

### 6) Delete center
- Method: `DELETE`
- Endpoint: `/centers/:id`
- Auth: None

### 7) Update volunteer count
- Method: `PATCH`
- Endpoint: `/centers/:id/volunteer-count`
- Auth: None
- Body:
```json
{ "action": "increment" }
```
- `action`: `increment` or any other value (decrement fallback)

### 8) Get active centers by district
- Method: `GET`
- Endpoint: `/centers/district/:district`
- Auth: None

---

## 5.8 Volunteers (`/api/volunteers`)

### 1) Get all volunteers
- Method: `GET`
- Endpoint: `/volunteers`
- Auth: None

### 2) Get volunteer by id
- Method: `GET`
- Endpoint: `/volunteers/:id`
- Auth: None

### 3) Add volunteer
- Method: `POST`
- Endpoint: `/volunteers`
- Auth: None
- Content-Type: `application/json`
- Minimum required model fields:
  - `firstName`, `lastName`, `email`, `nic`, `dob`

Example body:
```json
{
  "firstName": "Nimal",
  "lastName": "Perera",
  "email": "nimal@example.com",
  "nic": "200012345678",
  "dob": "2000-01-15",
  "district": "Colombo",
  "skills": ["sorting", "driving"]
}
```

### 4) Update volunteer
- Method: `PUT`
- Endpoint: `/volunteers/:id`
- Auth: None
- Body: any updatable volunteer fields

### 5) Delete volunteer
- Method: `DELETE`
- Endpoint: `/volunteers/:id`
- Auth: None
- Success: `204 No Content`

---

## 5.9 Contact (`/api/contact`)

### 1) Submit contact message
- Method: `POST`
- Endpoint: `/contact`
- Auth: None
- Content-Type: `multipart/form-data`
- Required fields:
  - `fullName`, `email`, `subject`, `inquiryType`, `message`
- Optional:
  - `phoneNumber`
  - `attachment` (single file, max 5MB)
- Allowed attachment types:
  - JPG, PNG, GIF, PDF, DOC, DOCX

Example cURL:
```bash
curl -X POST http://localhost:5000/api/contact \
  -F "fullName=John Doe" \
  -F "email=john@example.com" \
  -F "subject=Need help" \
  -F "inquiryType=support" \
  -F "message=I cannot upload images" \
  -F "attachment=@issue.png"
```

Success `201`:
```json
{
  "message": "Your message has been received.",
  "submission": {
    "_id": "...",
    "fullName": "John Doe"
  }
}
```

## 6. Standard Error Examples

Validation error:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "district", "message": "Invalid district" }
  ]
}
```

Auth error:
```json
{ "message": "Not authorized, token failed" }
```

Not found error:
```json
{ "success": false, "message": "Swap not found" }
```

## 7. Postman Testing Checklist

1. Register a normal user from `/api/users/register`.
2. Login and store JWT token.
3. Use token on protected endpoints (`/api/users/me`, `/api/users/profile`, `/api/admin/users`).
4. Create item -> create swap -> update swap status.
5. Verify notifications are generated.
6. Test pickup + center + volunteer + contact flows.

## 8. Known Notes for Evaluators

- Some endpoints are marked as admin/private in comments but currently do not enforce auth middleware.
- Route order in `swapRoutes.js` may cause `/by-item` to be shadowed by `/:id` depending on request path matching.
- Notification model enum does not include `completion_pending`, although controller attempts to create this type.

## 9. Useful Scripts

From `backend/`:
- `npm run dev` - start backend with nodemon
- `npm start` - start backend in production mode
- `npm run seed:admin` - seed initial admin user

From `frontend/`:
- `npm run dev` - start Vite dev server
- `npm run build` - build frontend
- `npm run preview` - preview production build
- `npm run lint` - lint frontend

## 10. License

ISC
