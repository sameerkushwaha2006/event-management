# EventHub - Online Event Management System

A comprehensive platform for creating, managing, and attending events with user authentication, payment processing, and admin functionality.

## Features

- User registration and authentication (email/password + Google OAuth)
- Event creation and management
- Event registration and ticket generation
- Payment processing with Stripe
- Admin dashboard for user and event management
- Responsive design (mobile-first)
- QR code-based check-in system

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **Payments**: Stripe
- **File Uploads**: Multer
- **Email**: Nodemailer

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Redis (for session storage)
- Stripe account (for payments)

### Installation

1. Clone the repository
2. Copy environment files and configure
3. Install dependencies
4. Start development servers

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Project Structure

```
├── backend/          # Node.js/Express API
├── frontend/         # React/Vite application
├── docker-compose.yml # Development environment
└── README.md
```

## License

MIT