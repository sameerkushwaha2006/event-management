# EventHub - Online Event Management System

A comprehensive platform for creating, managing, and attending events with user authentication, payment processing, and admin functionality.

## 🚀 Features

- ✅ User registration and authentication (JWT-based)
- ✅ Role-based access control (User, Organizer, Admin)
- 🚧 Event creation and management (in progress)
- 🚧 Event registration and ticket generation (planned)
- 🚧 Payment processing with Stripe (planned)
- ✅ Admin dashboard structure
- ✅ Responsive design (mobile-first)
- 🚧 QR code-based check-in system (planned)

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for state management
- **React Hook Form** for forms
- **Axios** for API calls

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Multer** for file uploads
- **Stripe** for payments (configured)

### Development Tools
- **Docker** & Docker Compose
- **ESLint** for code linting
- **Jest** for testing (configured)
- **PWA** support with Vite PWA plugin

## 🏗 Project Status

### ✅ Completed
- Project structure and setup
- Backend authentication system with JWT
- Database models (User, Event, Registration, Ticket, Payment)
- API endpoints structure
- Frontend authentication context and routing
- Responsive UI components with Tailwind CSS
- Login and registration pages
- Basic layout with header/footer
- Docker development environment

### 🚧 In Progress
- Event creation and listing functionality
- User dashboard and profile management

### 📋 Planned Features
- Event registration system
- Stripe payment integration
- Ticket generation with QR codes
- Admin dashboard with analytics
- Email notifications
- Advanced search and filtering
- Event analytics and reporting

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd event-management
```

2. **Start with Docker Compose**
```bash
# Development environment
docker-compose -f docker-compose.dev.yml up

# Production environment
docker-compose up
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017
- Redis: localhost:6379

### Option 2: Local Development

1. **Prerequisites**
```bash
# Ensure you have Node.js 18+, MongoDB, and Redis installed
node --version  # Should be 18+
mongod --version
redis-server --version
```

2. **Setup Backend**
```bash
cd backend
cp .env.example .env  # Configure your environment variables
npm install
npm run dev  # Starts on http://localhost:5000
```

3. **Setup Frontend**
```bash
cd frontend
cp .env.example .env  # Configure your environment variables
npm install
npm run dev  # Starts on http://localhost:3000
```

## 🔧 Configuration

### Backend Environment Variables (.env)
```bash
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/eventhub

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend Environment Variables (.env)
```bash
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 📁 Project Structure

```
event-management/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   ├── config/          # Configuration
│   │   └── app.ts           # Express app setup
│   ├── uploads/             # File upload directory
│   └── package.json
├── frontend/                # React/Vite application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── common/      # Button, Input, Modal, etc.
│   │   │   ├── layout/      # Header, Footer, Sidebar
│   │   │   └── ui/          # Loading, Error states
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # React context providers
│   │   ├── services/        # API service functions
│   │   ├── utils/           # Helper functions
│   │   ├── types/           # TypeScript definitions
│   │   └── styles/          # Global styles
│   └── package.json
├── docker-compose.yml       # Production environment
├── docker-compose.dev.yml   # Development environment
├── .gitignore
└── README.md
```

## 🔐 Authentication

The system uses JWT-based authentication with the following features:

- Access tokens (15-minute expiry)
- Refresh tokens (7-day expiry)
- Role-based authorization (User, Organizer, Admin)
- Password hashing with bcrypt
- Email verification (configured but not fully implemented)
- Password reset functionality (configured)

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Event Endpoints (Structure Ready)

- `GET /api/v1/events` - List events
- `GET /api/v1/events/:id` - Get event details
- `POST /api/v1/events` - Create event (auth required)
- `PUT /api/v1/events/:id` - Update event (auth required)
- `DELETE /api/v1/events/:id` - Delete event (auth required)

## 🧪 Testing

The project is configured with Jest for testing:

```bash
# Backend tests
cd backend
npm test
npm run test:watch
npm run test:coverage

# Frontend tests
cd frontend
npm test
npm run test:ui
```

## 🚀 Deployment

The application is containerized and ready for deployment:

1. **Build Docker images**
```bash
docker build -t eventhub-backend ./backend
docker build -t eventhub-frontend ./frontend
```

2. **Deploy with Docker Compose**
```bash
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/your-username/event-management/issues) page
2. Create a new issue with detailed information
3. Join our [Discord community](https://discord.gg/your-server) (coming soon)

## 🗺 Roadmap

### Phase 1: Core Functionality (Current)
- ✅ User authentication system
- ✅ Basic project structure
- ✅ UI components and design system
- 🚧 Event creation and management

### Phase 2: Event Management
- 📋 Event registration system
- 📋 Ticket generation with QR codes
- 📋 Event search and filtering
- 📋 User profiles and dashboards

### Phase 3: Payment & Advanced Features
- 📋 Stripe payment integration
- 📋 Admin dashboard with analytics
- 📋 Email notifications
- 📋 Event analytics and reporting

### Phase 4: Polish & Launch
- 📋 Comprehensive testing
- 📋 Performance optimization
- 📋 Security audit
- 📋 Production deployment

---

Built with ❤️ using modern web technologies