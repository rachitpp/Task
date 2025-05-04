# Task Management System

A comprehensive task management system with user authentication, task management, team collaboration, and more.

## 🚀 Features

### Core Features

- **User Authentication**: Registration, login, secure password storage, session handling
- **Task Management**: Create, read, update, delete tasks with title, description, due date, priority, status
- **Team Collaboration**: Assign tasks to other users, notify them on assignment
- **Dashboard**: Show tasks assigned to user, tasks they created, overdue tasks
- **Search & Filter**: Filter by title, description, status, priority, due date

### Advanced Features

- **Role-Based Access Control**: Admin, Manager, Regular User permissions
- **Real-Time Notifications**: For task assignments and updates
- **Recurring Tasks**: Support for daily, weekly, monthly repeats
- **Audit Logging**: Track user actions
- **Unit & Integration Tests**: Using Jest

## 🛠️ Tech Stack

### Backend

- **Node.js** with **Express.js**
- **MongoDB** for database
- **JWT** for authentication
- **bcrypt** for password hashing
- **express-validator** for input validation
- **Jest** for testing

### Frontend

- **Next.js** with **TypeScript**
- **TailwindCSS** for styling
- **React Query** for data fetching
- **Zustand** for state management
- **React Hook Form** for form handling

## 📋 Project Structure

```
task-management-system/
├── backend/                # Express.js server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Middleware functions
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routes
│   │   ├── tests/          # Jest tests
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Express app entry point
│   ├── .env                # Environment variables
│   └── package.json        # Backend dependencies
│
└── frontend/               # Next.js client
    ├── src/
    │   ├── app/            # Next.js App Router
    │   ├── components/     # React components
    │   ├── hooks/          # Custom React hooks
    │   ├── lib/            # Client utilities
    │   ├── services/       # API service layer
    │   └── stores/         # Zustand stores
    ├── public/             # Static files
    └── package.json        # Frontend dependencies
```

## 🔧 Setup & Installation

### Prerequisites

- Node.js (v16+)
- MongoDB

### Backend Setup

1. Navigate to the backend directory:

   ```
   cd task-management-system/backend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:

   ```
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/task-management-system
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=30d
   COOKIE_EXPIRES_IN=30
   ```

4. Start the development server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```
   cd task-management-system/frontend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## 🧪 Running Tests

### Backend Tests

```
cd task-management-system/backend
npm test
```

### Frontend Tests

```
cd task-management-system/frontend
npm test
```

## 🚀 Deployment

This application can be deployed to:

- Backend: Render, Railway, Heroku
- Frontend: Vercel, Netlify

## 📝 Design Decisions & Approaches

### Database Schema Design

- **User Model**: Includes authentication fields, role-based permissions, and notification preferences
- **Task Model**: Stores task details with relations to creators and assignees
- **Notification Model**: Handles task assignments and updates notifications
- **Audit Log Model**: Records user actions for security and accountability

### Security Implementation

- Passwords hashed with bcrypt
- JWT stored in HTTP-only cookies
- Input validation for all API endpoints
- CORS configured for secure cross-origin requests
- Helmet.js for HTTP security headers

### API Structure

- RESTful design principles
- Consistent response format
- Proper error handling and validation
- Middleware for authentication and authorization

## 🤝 Contribution & Development

This project was developed as part of a take-home assignment. Contributions are welcome through pull requests.

## 📄 License

This project is MIT licensed.

## 🙏 Acknowledgements

- Assisted by AI tools for code scaffolding and boilerplate generation
- UI design inspired by modern productivity applications

## Administrator Setup

The application requires at least one administrator account to manage users and roles. There are several ways to create the initial administrator:

### Option 1: Use the Admin Seeding Script

Run the following command to create an initial admin user:

```bash
npm run seed:admin
```

This will create an admin user with the following credentials (which can be customized via environment variables):

- Email: admin@example.com (override with ADMIN_EMAIL)
- Password: adminPassword123! (override with ADMIN_PASSWORD)
- Name: Admin User (override with ADMIN_NAME)

### Option 2: Enable First-User-As-Admin Mode

Set the following environment variable in your .env file:

```
FIRST_USER_ADMIN=true
```

With this setting, the first user who registers in the system will automatically be assigned the admin role.

### Option 3: Manual Database Update

If you already have users in the system but no admin, you can update a user's role directly in the database:

```javascript
// Using MongoDB shell
db.users.updateOne({ email: "user@example.com" }, { $set: { role: "admin" } });
```

**Important Security Note:** After setting up your administrator account, if you used Option 2 (FIRST_USER_ADMIN), make sure to set this environment variable back to `false` to prevent any security issues.
