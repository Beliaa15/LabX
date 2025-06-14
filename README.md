# LabX - Educational Platform
A comprehensive full-stack educational platform that enables teachers to create courses, manage students, and facilitate online learning through **3D interactive laboratory experiences** and engaging educational content.

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Beliaa15/GP-website)

## 🎯 Main Feature

### 🔬 3D Interactive Labs
The core innovation of LabX is its **3D interactive laboratory environment** that allows students to:
- **Virtual Experiments** - Conduct realistic laboratory experiments in a safe, controlled 3D environment
- **Interactive Simulations** - Manipulate virtual equipment and observe real-time results
- **Immersive Learning** - Experience hands-on learning without physical lab constraints
- **Safety Training** - Practice laboratory procedures without safety risks
- **Accessibility** - Access advanced lab equipment regardless of physical location or availability

## 🚀 Features

### Core Educational Functionality
- **3D Interactive Labs** - Immersive virtual laboratory experiences for practical learning
- **User Authentication & Authorization** - Complete authentication system with JWT tokens and Google OAuth integration
- **Course Management** - Teachers can create, update, and manage courses with enrollment capabilities
- **Student Dashboard** - Dedicated dashboard for students to view enrolled courses, assignments, and access 3D labs
- **Teacher Dashboard** - Comprehensive teacher interface for course, student, and lab management
- **Admin Panel** - Administrative interface for platform management
- **File Upload & Management** - Support for course materials and student submissions
- **Interactive Tasks** - Including specialized tasks like XOR logic exercises and lab assignments

### Technical Features
- **3D Rendering Engine** - Advanced 3D graphics for realistic laboratory simulations
- **Real-time Interactions** - Responsive 3D environment with physics simulation
- **Progress Tracking** - Monitor student performance in virtual lab exercises
- **API Documentation** - Comprehensive Swagger/OpenAPI documentation
- **Security** - Helmet for security headers, CORS protection, and rate limiting
- **Caching** - Redis integration for improved performance
- **Responsive Design** - Modern UI with Tailwind CSS and custom components

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis for session management and caching
- **Authentication**: JWT tokens with Passport.js and Google OAuth 2.0
- **Security**: Helmet, CORS, bcrypt for password hashing, and express-rate-limit
- **File Handling**: Multer for file uploads

### Frontend
- **Framework**: React 18 with modern hooks and functional components
- **3D Graphics**: Unity WebGL builds integrated for 3D laboratory environments and simulations
- **Routing**: React Router v6 for navigation
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: Zustand for global state management
- **HTTP Client**: Axios for API communication
- **UI Components**: Lucide React icons, React Icons, and custom UI components

### DevOps & Deployment
- **Containerization**: Docker with Docker Compose for easy deployment
- **Environment Management**: dotenv for configuration management

## 📁 Project Structure

```
LabX/
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
    │   │   ├── Labs/     # 3D interactive lab components
    │   │   ├── Tasks/    # Interactive task components
    │   │   └── ui/       # Reusable UI components
    │   ├── context/      # React Context providers
    │   ├── hooks/        # Custom React hooks
    │   ├── services/     # API service layer
    │   ├── three/        # 3D graphics and lab configurations
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
- Modern browser with WebGL support for 3D labs

### Quick Start with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Beliaa15/LabX.git
   cd LabX
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
- 3D lab configuration and progress tracking
- File upload and management
- Task assignment and submission

## 🔬 3D Lab Features

### Virtual Laboratory Equipment
- Interactive 3D models of laboratory instruments
- Realistic physics simulation for equipment behavior
- Step-by-step guided experiments
- Real-time result visualization

### Educational Benefits
- **Safe Learning Environment** - Practice without physical risks
- **Cost-Effective** - Access expensive equipment virtually
- **Accessibility** - Available 24/7 from anywhere
- **Repeatability** - Students can repeat experiments multiple times
- **Immediate Feedback** - Real-time guidance and assessment

## 🔧 Development

### Backend Development
The backend follows a modular structure with separate layers for routes, controllers, models, and middleware.

### Frontend Development  
The frontend uses modern React patterns with context providers for state management and protected routes for authentication. 3D labs are implemented using Three.js for immersive experiences.

### Database Models
The application includes models for:
- Users (students, teachers, admins)
- Courses with teacher-student relationships
- 3D lab configurations and progress tracking
- Tasks and assignments
- Student submissions
- Course materials and folders

## 🚀 Deployment

### Docker Deployment (Recommended)
The application includes a complete Docker setup with MongoDB and Redis services.

### Manual Deployment
1. Build the frontend for production
2. Configure production environment variables
3. Set up MongoDB and Redis instances
4. Deploy using your preferred hosting platform
5. Ensure WebGL support for 3D lab functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository or contact the development team.

---

**LabX** revolutionizes online education by combining traditional course management with cutting-edge 3D interactive laboratory experiences. Students can now access realistic virtual labs, conduct experiments safely, and gain hands-on experience regardless of physical limitations or equipment availability.
