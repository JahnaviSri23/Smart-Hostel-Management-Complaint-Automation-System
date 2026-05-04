# 🏨 Smart Hostel Management & Complaint Automation System

A full-stack, production-ready hostel management system with role-based dashboards, complaint tracking, and automated staff assignments.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + TailwindCSS + Recharts |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| HTTP Client | Axios |
| Routing | React Router v6 |

---

## 📁 Project Structure

```
hostel-system/
├── backend/
│   ├── config/
│   │   └── seed.js               # Database seeder
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── complaintController.js
│   │   ├── maintenanceController.js
│   │   ├── notificationController.js
│   │   ├── roomController.js
│   │   └── studentController.js
│   ├── middleware/
│   │   └── auth.js               # JWT + role-based middleware
│   ├── models/
│   │   ├── Complaint.js
│   │   ├── Maintenance.js
│   │   ├── Notification.js
│   │   ├── Room.js
│   │   ├── Student.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── maintenanceRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── roomRoutes.js
│   │   └── studentRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx         # Sidebar + top navbar
    │   │   └── UI.jsx             # Reusable components
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── AdminComplaints.jsx
    │   │   │   ├── AdminStudents.jsx
    │   │   │   └── AdminRooms.jsx
    │   │   ├── student/
    │   │   │   ├── StudentDashboard.jsx
    │   │   │   ├── SubmitComplaint.jsx
    │   │   │   └── MyComplaints.jsx
    │   │   ├── maintenance/
    │   │   │   └── MaintenanceDashboard.jsx
    │   │   └── shared/
    │   │       └── ComplaintDetail.jsx
    │   ├── utils/
    │   │   └── api.js             # Axios API calls
    │   ├── App.js
    │   └── index.js
    ├── tailwind.config.js
    └── package.json
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js >= 16
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

### 1️⃣ Clone & Navigate

```bash
cd hostel-system
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install

# Copy environment file
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hostel_management
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Seed the database with sample data:**
```bash
npm run seed
```

**Start the backend server:**
```bash
npm run dev      # Development (with nodemon)
# OR
npm start        # Production
```

Backend runs at: `http://localhost:5000`

---

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin / Warden** | admin@hostel.com | admin123 |
| **Maintenance Staff** | ravi@hostel.com | staff123 |
| **Maintenance Staff** | suresh@hostel.com | staff123 |
| **Student** | arjun@student.com | student123 |
| **Student** | priya@student.com | student123 |
| **Student** | ali@student.com | student123 |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/update-password` | Update password |

### Complaints
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/complaints` | All roles |
| POST | `/api/complaints` | Student |
| GET | `/api/complaints/stats` | Admin |
| GET | `/api/complaints/:id` | All roles |
| PUT | `/api/complaints/:id` | Admin, Maintenance |
| DELETE | `/api/complaints/:id` | Admin, Student (own) |

### Rooms
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/rooms` | All roles |
| POST | `/api/rooms` | Admin |
| PUT | `/api/rooms/:id` | Admin |
| DELETE | `/api/rooms/:id` | Admin |

### Students
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/students` | Admin |
| GET | `/api/students/maintenance-staff` | Admin |
| PUT | `/api/students/:id` | Admin |

### Maintenance
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/maintenance/tasks` | Maintenance, Admin |
| PUT | `/api/maintenance/tasks/:id` | Maintenance, Admin |

### Notifications
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/notifications` | All roles |
| PUT | `/api/notifications/:id/read` | All roles |

---

## ✨ Features Summary

### Student
- Register & Login with room info
- 3-step guided complaint submission with category icons
- View complaint status (Open, In Progress, Resolved)
- Complaint timeline tracking
- Notification bell for status updates

### Admin / Warden
- Dashboard with stats charts (Pie + Bar via Recharts)
- View & manage all complaints with filters + search
- Quick assign to maintenance staff
- Quick status change (Start / Resolve)
- Student management (edit room, course, status)
- Room management (CRUD, capacity, status)
- Notification system

### Maintenance Staff
- Dashboard of assigned tasks
- Start / Complete tasks with one click
- Add progress notes to tasks
- Notifications for new assignments

---

## 🎨 Design Features

- Dark theme with brand-blue accent
- Custom fonts: Sora (display) + DM Sans (body)
- Responsive design (mobile + desktop)
- Animated page transitions
- Real-time notification polling
- Loading states & empty states
- Toast notifications

---

## 🔒 Security

- JWT authentication with expiry
- Bcrypt password hashing (12 salt rounds)
- Role-based access control on all routes
- Request validation with express-validator
- Centralized error handling

---

## 🐳 MongoDB Atlas (Cloud)

Replace `MONGO_URI` in `.env` with your Atlas connection string:
```



MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/hostel_management?retryWrites=true&w=majority
```
##Website Overview
https://drive.google.com/file/d/1zwgD41U_kPWgmlGHIJZ_36BvCzyFKj-W/view?usp=drive_link

https://drive.google.com/file/d/1bXki4-ztiK20hEXLlxvMX13zAS0rZYSh/view?usp=drive_link
