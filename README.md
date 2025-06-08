# LabX - Educational Platform

A comprehensive full-stack educational platform that enables teachers to create courses, manage students, and facilitate online learning through interactive content and assignments.

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Beliaa15/GP-website)


## 🚀 Features

### Core Functionality
- **User Authentication & Authorization** - Complete authentication system with JWT tokens and Google OAuth integration [1](#0-0) 
- **Course Management** - Teachers can create, update, and manage courses with enrollment capabilities [2](#0-1) 
- **Student Dashboard** - Dedicated dashboard for students to view enrolled courses and assignments [3](#0-2) 
- **Teacher Dashboard** - Comprehensive teacher interface for course and student management [4](#0-3) 
- **Admin Panel** - Administrative interface for platform management [5](#0-4) 
- **File Upload & Management** - Support for course materials and student submissions [6](#0-5) 
- **Interactive Tasks** - Including specialized tasks like XOR logic exercises [7](#0-6) 

### Technical Features
- **API Documentation** - Comprehensive Swagger/OpenAPI documentation [8](#0-7) 
- **Security** - Helmet for security headers, CORS protection, and rate limiting [9](#0-8) 
- **Caching** - Redis integration for improved performance [10](#0-9) 
- **Responsive Design** - Modern UI with Tailwind CSS and custom components [11](#0-10) 

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with Express.js framework [12](#0-11) 
- **Database**: MongoDB with Mongoose ODM [13](#0-12) 
- **Caching**: Redis for session management and caching [10](#0-9) 
- **Authentication**: JWT tokens with Passport.js and Google OAuth 2.0 [14](#0-13) 
- **Security**: Helmet, CORS, bcrypt for password hashing, and express-rate-limit [15](#0-14) 
- **File Handling**: Multer for file uploads [6](#0-5) 

### Frontend
- **Framework**: React 18 with modern hooks and functional components [16](#0-15) 
- **Routing**: React Router v6 for navigation [17](#0-16) 
- **Styling**: Tailwind CSS with Radix UI components [18](#0-17) 
- **State Management**: Zustand for global state management [19](#0-18) 
- **HTTP Client**: Axios for API communication [20](#0-19) 
- **UI Components**: Lucide React icons, React Icons, and custom UI components [21](#0-20) 

### DevOps & Deployment
- **Containerization**: Docker with Docker Compose for easy deployment [22](#0-21) 
- **Environment Management**: dotenv for configuration management [23](#0-22) 

## 📁 Project Structure

```
GP-website/
├── backend/                 # Node.js/Express API server
│   ├── config/             # Database and Redis configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB/Mongoose models
│   ├── routes/            # API routes
│   ├── docs/              # API documentation
│   ├── app.js             # Express application setup
│   ├── package.json       # Backend dependencies
│   ├── docker-compose.yml # Docker configuration
│   └── swagger.js         # Swagger configuration
└── frontend/               # React client application
    ├── public/            # Static assets
    ├── src/
    │   ├── components/    # React components
    │   │   ├── Auth/     # Authentication components
    │   │   ├── Pages/    # Page components
    │   │   ├── Tasks/    # Interactive task components
    │   │   └── ui/       # Reusable UI components
    │   ├── context/      # React Context providers
    │   ├── hooks/        # Custom React hooks
    │   ├── services/     # API service layer
    │   └── utils/        # Utility functions
    ├── package.json      # Frontend dependencies
    └── tailwind.config.js # Tailwind CSS configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or later)
- MongoDB (v4.4 or later)
- Redis (v6 or later)
- npm or yarn package manager

### Quick Start with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Beliaa15/GP-website.git
   cd GP-website
   ```

2. **Set up environment variables**
   Create `.env` files in both backend and frontend directories with required variables.

3. **Run with Docker Compose**
   ```bash
   cd backend
   docker-compose up -d
   ```

### Manual Installation

#### Backend Setup
1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file with:
   ```
   MONGODB_URI=mongodb://localhost:27017/gp-website
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your-jwt-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ALLOWED_ORIGINS=http://localhost:3000
   ```

4. **Start the backend server**
   ```bash
   npm start
   ```

#### Frontend Setup
1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file with:
   ```
   REACT_APP_API_URL=http://localhost:3000/api
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

## 📚 API Documentation

The API documentation is available via Swagger UI when the backend server is running:
- **Local**: `http://localhost:3000/api-docs`
- **Production**: `[your-domain]/api-docs`

The API includes endpoints for:
- User authentication and management
- Course creation and management
- Student enrollment and progress tracking
- File upload and management
- Task assignment and submission

## 🔧 Development

### Backend Development
The backend follows a modular structure with separate layers for routes, controllers, models, and middleware [24](#0-23) .

### Frontend Development  
The frontend uses modern React patterns with context providers for state management [25](#0-24)  and protected routes for authentication [26](#0-25) .

### Database Models
The application includes models for:
- Users (students, teachers, admins)
- Courses with teacher-student relationships [27](#0-26) 
- Tasks and assignments [28](#0-27) 
- Student submissions [29](#0-28) 
- Course materials and folders [30](#0-29) 

## 🚀 Deployment

### Docker Deployment (Recommended)
The application includes a complete Docker setup with MongoDB and Redis services [31](#0-30) .

### Manual Deployment
1. Build the frontend for production
2. Configure production environment variables
3. Set up MongoDB and Redis instances
4. Deploy using your preferred hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License [32](#0-31) .

## 🆘 Support

For support and questions, please open an issue in the GitHub repository or contact the development team.

---

**Notes**: This educational platform is designed to facilitate online learning with modern web technologies. The application supports multiple user roles (students, teachers, admins) and provides comprehensive course management capabilities. The Docker configuration makes deployment straightforward, while the modular architecture ensures maintainability and scalability.
