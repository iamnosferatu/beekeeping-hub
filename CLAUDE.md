# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Code style
- React / express application
- Use best practice and components where possible
- Add code comments to help readability
- Always use best practice for a react frontend and an express backend.
- Do not use typescript.
- Do not use mock data in any code.
- Always break code into small components where possible and where best practice would suggest.. 
- Don't waste time with 'example' code, or simplified versions, only generate production ready code that fits in with my existing codebase and implements the changes or improvements being discussed.


## Development Commands

### Frontend (from `/frontend` directory)
```bash
npm run dev        # Start development server on port 3000
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
npm run enable-forum  # Enable forum feature
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18.2 with Bootstrap 5.2, React Router 6, Axios, React Query, SCSS
- **Backend**: Express.js with Sequelize ORM, JWT authentication
- **Database**: MySQL 8.0 with PHPMyAdmin interface
- **API Documentation**: Swagger/OpenAPI 3.0
- **Containerization**: Docker Compose orchestration

### Key Architectural Patterns

1. **API Structure**: RESTful design with standard endpoints
   - Authentication: `/api/auth/*`
   - Articles: `/api/articles/*`
   - Comments: `/api/comments/*`
   - Tags: `/api/tags/*`
   - Forum: `/api/forum/*`
   - Admin: `/api/admin/*`
   - Admin Forum: `/api/admin/forum/*`

2. **Authentication**: JWT-based with Bearer tokens
   - Tokens in Authorization header: `Bearer <token>`
   - Role-based access: user, author, admin
   - Protected routes using `protect` and `authorize` middleware

3. **Frontend Organization**:
   - **Contexts**: AuthContext, ThemeContext, and SiteSettingsContext for global state
   - **Custom Hooks**: Centralized API logic in `/hooks/api/`
   - **Components**: Modular structure with articles/, admin/, editor/, forum/, etc.
   - **Layouts**: MainLayout and AdminLayout for consistent UI

4. **Backend Structure**:
   - **MVC Pattern**: Controllers handle routes, Models define data
   - **Middleware**: Auth, rate limiting, validation, error handling
   - **Database Relations**: Many-to-many (articles-tags), One-to-many (users-articles), nested comments

### Database Schema

#### Core Tables
- **users**: id, username, email, password, role, bio, avatar, email_verified, last_login
- **articles**: id, title, slug, content, excerpt, featured_image, status, user_id, is_blocked
- **comments**: id, content, status, user_id, article_id, parent_id, reported_by
- **tags**: id, name, slug, description
- **article_tags**: Junction table for many-to-many relationship
- **likes**: id, user_id, article_id

#### Forum Tables
- **forum_categories**: id, name, slug, description, user_id, is_blocked
- **forum_threads**: id, title, slug, content, category_id, user_id, is_pinned, is_locked, is_blocked
- **forum_comments**: id, content, thread_id, user_id, parent_comment_id, is_blocked
- **user_forum_bans**: id, user_id, banned_by, reason, expires_at

#### Other Tables
- **site_settings**: Various configuration options including forum_enabled
- **newsletter**: Email subscriptions
- **contact**: Contact form submissions
- **author_applications**: Author role applications

### Environment Configuration
Create `.env` file in backend directory with:
- Database: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD
- JWT_SECRET for authentication
- EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS for email service
- FRONTEND_URL=http://localhost:3000
- NODE_ENV=development

### API Documentation
- Swagger UI: http://localhost:8080/api-docs
- All endpoints are documented with request/response schemas
- Includes authentication requirements and examples

### Debug Tools
- Frontend Debug Page: http://localhost:3000/debug
- Admin Diagnostics: http://localhost:3000/admin/diagnostics (admin only)
- API Status: http://localhost:8080/api/health
- Database Connection Test: `npm run test-db`

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
   - Add Swagger documentation to route file
   - Add corresponding API hook in `/frontend/src/hooks/api/`

2. **Creating new React components**:
   - Follow existing component structure in `/frontend/src/components/`
   - Use Bootstrap classes for styling consistency
   - Implement responsive design (mobile-first)
   - Consider creating reusable components for common patterns

3. **Database changes**:
   - Create migration: `cd backend && npx sequelize-cli migration:create --name your-migration-name`
   - Run migrations: `npm run migrate`
   - Update models in `/backend/src/models/`
   - Ensure field names use snake_case in database

4. **Theme customization**:
   - Themes defined in ThemeContext
   - Four themes available: Default, Dark, Nature, Elegant
   - Theme switching handled by ThemeContext
   - SCSS variables in theme-specific files

### Important Notes

1. **Field Naming Convention**:
   - Database uses snake_case (e.g., created_at, is_blocked)
   - JavaScript uses camelCase (e.g., createdAt, isBlocked)
   - Sequelize models handle the mapping with `underscored: true`

2. **Error Handling**:
   - Backend uses custom error classes in `/backend/src/utils/errors.js`
   - Frontend has ErrorBoundary components for graceful error handling
   - All API errors follow consistent format: `{ success: false, error: { message, code, statusCode } }`

3. **Performance Considerations**:
   - React Query for caching and request deduplication
   - Lazy loading for code splitting
   - Image optimization with responsive sizes
   - Database indexes on frequently queried fields

4. **Security Best Practices**:
   - Input validation on both frontend and backend
   - SQL injection prevention via Sequelize ORM
   - XSS protection with proper React rendering
   - CORS configuration for API access
   - Rate limiting on sensitive endpoints

5. **Forum Feature**:
   - Forum is feature-flagged and can be enabled/disabled
   - Requires author or admin role to create content
   - Supports nested comments with parent references
   - Admin tools for content moderation and user bans