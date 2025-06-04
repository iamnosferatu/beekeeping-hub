# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (from `/frontend` directory)
```bash
npm start          # Start development server on port 3000
npm run build      # Build production bundle
npm test           # Run Jest tests
```

### Backend (from `/backend` directory)
```bash
npm run dev        # Start with nodemon (hot reload) on port 8080
npm start          # Start production server
npm run migrate    # Run database migrations
npm run seed       # Seed database with sample data
npm run create-admin  # Create an admin user
npm run test-db    # Test database connection
```

### Docker Commands (from root directory)
```bash
docker-compose up -d     # Start all services
docker-compose down      # Stop all services
docker-compose up --build  # Rebuild and start services
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18.2 with Bootstrap 5.2, React Router 6, Axios, Formik, SCSS
- **Backend**: Express.js with Sequelize ORM, JWT authentication
- **Database**: MySQL 8.0 with PHPMyAdmin interface
- **Containerization**: Docker Compose orchestration

### Key Architectural Patterns

1. **API Structure**: RESTful design with standard endpoints
   - Authentication: `/api/auth/*`
   - Articles: `/api/articles/*`
   - Comments: `/api/comments/*`
   - Admin: `/api/admin/*`

2. **Authentication**: JWT-based with Bearer tokens
   - Tokens in Authorization header: `Bearer <token>`
   - Role-based access: user, author, admin
   - Protected routes using `protect` and `authorize` middleware

3. **Frontend Organization**:
   - **Contexts**: AuthContext and ThemeContext for global state
   - **Custom Hooks**: Centralized API logic in `/hooks/api/`
   - **Components**: Modular structure with articles/, admin/, editor/, etc.
   - **Layouts**: MainLayout and AdminLayout for consistent UI

4. **Backend Structure**:
   - **MVC Pattern**: Controllers handle routes, Models define data
   - **Middleware**: Auth, rate limiting, validation, error handling
   - **Database Relations**: Many-to-many (articles-tags), One-to-many (users-articles)

### Database Schema
- **users**: id, username, email, password, role, bio, avatar
- **articles**: id, title, slug, content, excerpt, featured_image, status, user_id
- **comments**: id, content, status, user_id, article_id, parent_id
- **tags**: id, name, slug, description
- **article_tags**: Junction table for many-to-many relationship
- **likes**: id, user_id, article_id

### Environment Configuration
Create `.env` file in root with:
- Database credentials (MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD)
- JWT_SECRET for authentication
- Service ports (FRONTEND_PORT=3000, BACKEND_PORT=8080)
- CORS_ORIGIN=http://localhost:3000

### Debug Tools
- Frontend Debug Page: http://localhost:3000/debug
- Admin Diagnostics: http://localhost:3000/admin/diagnostics (admin only)
- Backend Debug: http://localhost:8080/debug

### Testing Approach
- Frontend: Jest with React Testing Library
- Backend: Jest with Supertest
- Run frontend tests: `cd frontend && npm test`
- Run backend tests: `cd backend && npm test`

### Common Development Tasks

1. **Adding a new API endpoint**:
   - Create controller in `/backend/src/controllers/`
   - Add route in `/backend/src/routes/`
   - Update `/backend/src/routes/index.js`
   - Add corresponding API hook in `/frontend/src/hooks/api/`

2. **Creating new React components**:
   - Follow existing component structure in `/frontend/src/components/`
   - Use Bootstrap classes for styling consistency
   - Implement responsive design (mobile-first)

3. **Database changes**:
   - Create migration: `cd backend && npx sequelize-cli migration:create --name your-migration-name`
   - Run migrations: `npm run migrate`
   - Update models in `/backend/src/models/`

4. **Theme customization**:
   - Themes defined in frontend context
   - Four themes available: Default, Dark, Nature, Elegant
   - Theme switching handled by ThemeContext