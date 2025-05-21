# Beekeeping Hub

A modern, mobile-first blog application for beekeeping enthusiasts with a comprehensive feature set.

## Features

1. **Articles System**
   - Full CRUD operations for articles
   - Markdown content with syntax highlighting
   - Featured images
   - Comments with moderation
   - Likes and social sharing

2. **User Management**
   - Role-based permissions (user, author, admin)
   - User profiles
   - Authentication with JWT
   - Registration and login

3. **Content Organization**
   - Tags for categorizing articles
   - Full-text search
   - Pagination

4. **Admin Area**
   - Dashboard with statistics
   - Content moderation
   - User management
   - Settings configuration

5. **Technical Features**
   - Responsive, mobile-first design
   - Bootstrap-based theming system with multiple themes
   - Well-structured, modular codebase
   - Docker configuration for development
   - MySQL database with seed data
   - Debug pages for frontend and backend

## Technology Stack

- **Frontend**: React, Bootstrap, React Router, Axios, Formik
- **Backend**: Node.js, Express.js, Sequelize ORM
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Containerization**: Docker, Docker Compose

## Project Structure

```
beekeeping-hub/
├── docker-compose.yml         # Docker orchestration
├── .env                       # Environment variables
├── .gitignore                 # Git ignore file
│
├── frontend/                  # React frontend application
│   ├── Dockerfile             # Frontend container
│   ├── package.json           # Frontend dependencies
│   ├── public/                # Static assets
│   └── src/                   # React source code
│       ├── assets/            # Images, fonts, etc.
│       ├── components/        # Reusable components
│       ├── contexts/          # React contexts
│       ├── hooks/             # Custom hooks
│       ├── layouts/           # Page layouts
│       ├── pages/             # Page components
│       ├── services/          # API services
│       ├── theme/             # Theme configuration
│       ├── utils/             # Utility functions
│       ├── App.js             # Main App component
│       └── index.js           # Entry point
│
└── backend/                   # Express backend
    ├── Dockerfile             # Backend container
    ├── package.json           # Backend dependencies
    ├── src/                   # Backend source code
    │   ├── config/            # Configuration
    │   ├── controllers/       # Route controllers
    │   ├── middleware/        # Express middleware
    │   ├── models/            # Database models
    │   ├── routes/            # API routes
    │   ├── services/          # Business logic
    │   ├── utils/             # Utility functions
    │   └── index.js           # Entry point
    ├── seeds/                 # Database seed data
    └── migrations/            # Database migrations
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- npm or yarn

### Installation and Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/beekeeper-blog.git
   cd beekeeper-blog
   ```

2. Create .env file (use .env.example as a template)
   ```bash
   cp .env.example .env
   ```

3. Start the application using Docker Compose
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api
   - PHPMyAdmin: http://localhost:8080

### Development Setup

For local development without Docker:

1. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

4. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

## API Documentation

The API provides the following endpoints:

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

### Articles

- `GET /api/articles` - Get all articles
- `GET /api/articles/:slug` - Get single article
- `POST /api/articles` - Create article (requires auth)
- `PUT /api/articles/:id` - Update article (requires auth)
- `DELETE /api/articles/:id` - Delete article (requires auth)
- `POST /api/articles/:id/like` - Like/unlike article (requires auth)

### Comments

- `GET /api/comments` - Get all comments
- `POST /api/comments` - Create comment (requires auth)
- `PUT /api/comments/:id` - Update comment (requires auth)
- `DELETE /api/comments/:id` - Delete comment (requires auth)
- `PUT /api/comments/:id/status` - Update comment status (admin only)

### Tags

- `GET /api/tags` - Get all tags
- `GET /api/tags/:slug` - Get single tag with related articles

### Admin

- `GET /api/admin/dashboard` - Get admin dashboard stats (admin only)
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/:id/role` - Update user role (admin only)
- `GET /api/admin/comments` - Get all comments for moderation (admin only)

## Debugging

Debug pages are available for both frontend and backend:

- Frontend: http://localhost:3000/debug
- Backend: http://localhost:8080/debug

## Database

The application uses MySQL for data storage. The database schema includes:

- Users (id, username, email, password, role, etc.)
- Articles (id, title, slug, content, user_id, etc.)
- Comments (id, content, status, user_id, article_id, etc.)
- Tags (id, name, slug, description)
- ArticleTags (junction table)
- Likes (id, user_id, article_id)

## Theming

The application supports multiple themes:

1. **Default** - Light theme with honey yellow accent
2. **Dark** - Dark theme with honey yellow accent
3. **Nature** - Light theme with green accent
4. **Elegant** - Light theme with gold and dark accents

Themes can be selected in the sidebar and affect the entire application.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Bootstrap for the UI framework
- React ecosystem for frontend components
- Express.js for the backend API
- Sequelize for database ORM
- Docker for containerization



1. Frontend Diagnostics Page
The admin diagnostics page features:

Endpoint Tester: Allows admins to:

Send requests to any API endpoint
Select HTTP method (GET, POST, PUT, DELETE)
Provide custom request headers and body
View detailed response information including status code, headers, and formatted JSON
Track response time for performance analysis


System Information: Displays critical system data:

Server environment, uptime, and Node.js version
Memory and CPU usage statistics
Database connection status and configuration
Environment variables (non-sensitive)


Request History: Maintains a log of recent API requests:

Stores URL, method, status code, and timestamp
Allows quick reloading of past requests for retesting
Provides color-coded status indicators



2. Backend Support
The backend implementation includes:

Diagnostics Endpoints:

/api/admin/diagnostics/system - Returns system information
/api/admin/diagnostics/logs - Returns application logs
/api/admin/diagnostics/metrics - Returns API metrics
/api/admin/diagnostics/database - Returns database diagnostics
/api/admin/diagnostics/test-endpoint - For testing endpoint connectivity


Security:

All diagnostic endpoints are protected by authentication
Only users with the 'admin' role can access these endpoints
Frontend page checks for admin privileges before rendering



3. Navigation and Integration

Added a new "Diagnostics" menu item in the admin sidebar
Added route in the React Router configuration
Integrated with the existing authentication system
Improved the admin layout with active link highlighting

How to Use the Diagnostics Page

Log in as an admin user
Navigate to the Admin area
Click on "Diagnostics" in the sidebar
Use the tabs to access different diagnostic tools:

Use "Endpoint Tester" to send requests to any API endpoint
View system information in the "System Information" tab
See previous requests in the "Request History" tab



This diagnostics tool provides a powerful way for administrators to troubleshoot issues, test API endpoints, and monitor system health - all within a secure, admin-only interface.
To start using it:

Rebuild your Docker containers: docker-compose down && docker-compose up --build
Login as an admin user
Navigate to the Admin area and click on the "Diagnostics" link in the sidebar