# ArtLink Backend API

A Node.js/Express backend for the ArtLink freelancing platform connecting clients with freelancers.

## =� Current Status

**� IN DEVELOPMENT** - Several critical issues need fixing before deployment:

- Import/export mismatches in models
- Empty server.js and route files  
- Model-controller field inconsistencies
- Missing authentication implementation

See `TEAM_COLLABORATION.md` for detailed issue breakdown and team assignments.

## <� Architecture

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Cloudinary integration
- **Payment**: Stripe integration

### Project Structure
```
backend/
   config/
      cloudinary.js      # Cloudinary configuration
      database.js        # PostgreSQL connection
   controllers/           # Business logic
      auth.controller.js
      client.controller.js
      freelancer.controller.js
      portfolio.controller.js
      project.controller.js
      user.controller.js
   middlewares/           # Custom middleware
      auth.middleware.js
      error.middleware.js
   models/               # Sequelize models
      applications.model.js
      client.model.js
      freelancer.model.js
      message.model.js
      portfolio.model.js
      project.model.js
      user.model.js
   routes/               # API endpoints
      auth.routes.js
      client.routes.js
      freelancer.routes.js
      portfolio.routes.js
      project.routes.js
      user.routes.js
   services/             # External services
      ai-detection.service.js
      cloudinary.service.js
      stripe.service.js
   utils/                # Utility functions
      jwt.js
      validator.js
   server.js             # Application entry point
```

## =� Database Schema

### Core Entities

**Users** (Base authentication)
- userId (PK)
- email (unique)
- password (hashed)
- role (client|freelancer)

**Clients** (Client profiles)
- clientId (PK)
- userId (FK -> Users)
- organization
- name
- avatarUrl

**Freelancers** (Freelancer profiles)
- freelancerId (PK)
- userId (FK -> Users)
- skills
- hourlyRate
- avatarUrl

**Projects** (Client job postings)
- projectId (PK)
- clientId (FK -> Clients)
- title
- description
- budget
- status (open|in_progress|completed|cancelled)

**Applications** (Freelancer project applications)
- applicationId (PK)
- freelancerId (FK -> Freelancers)
- projectId (FK -> Projects)
- coverLetter
- proposedRate

## =' Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Cloudinary account (for file uploads)
- Stripe account (for payments)

### Installation

1. **Clone and install dependencies**
```bash
cd backend
npm install
```

2. **Environment configuration**
Create `.env` file:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/artlink
DB_HOST=localhost
DB_PORT=5432
DB_NAME=artlink
DB_USER=your_username
DB_PASSWORD=your_password

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Cloudinary (file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe (payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App Configuration
PORT=3000
NODE_ENV=development
```

3. **Database setup**
```bash
# Create PostgreSQL database
createdb artlink

# Run migrations (once implemented)
npm run migrate

# Seed data (once implemented)
npm run seed
```

4. **Start development server**
```bash
npm run dev
```

## =� API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create client profile
- `GET /api/clients/:id` - Get client by ID
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Freelancers
- `GET /api/freelancers` - Get all freelancers
- `POST /api/freelancers` - Create freelancer profile
- `GET /api/freelancers/:id` - Get freelancer by ID
- `PUT /api/freelancers/:id` - Update freelancer
- `DELETE /api/freelancers/:id` - Delete freelancer

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Applications
- `GET /api/applications` - Get applications
- `POST /api/applications` - Submit application
- `PUT /api/applications/:id/status` - Update application status

## = Security Features

- JWT authentication
- Password hashing with bcrypt
- Input validation
- SQL injection prevention (Sequelize ORM)
- CORS configuration
- Environment variable protection

## >� Testing

```bash
# Run tests (once implemented)
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

## =� Deployment

### Production Environment
1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secrets
4. Enable HTTPS
5. Set up monitoring/logging

### Docker (Optional)
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

## = Known Issues

1. **Import/Export Mismatch**: User model exports need fixing
2. **Empty Files**: server.js and several routes are empty
3. **Field Mismatch**: Controller queries fields not in models
4. **Association Conflicts**: Duplicate model associations

## > Contributing

See `TEAM_COLLABORATION.md` for:
- Team member assignments
- Development workflow
- Code review process
- Integration guidelines

## =� Development Notes

- Use ES6 modules (type: "module" in package.json)
- Follow RESTful API conventions
- Implement proper error handling
- Add input validation for all endpoints
- Document all API changes
- Test before merging

## =� Support

For questions about the backend implementation, check:
1. `TEAM_COLLABORATION.md` for task assignments
2. Model files for database schema
3. Controller files for business logic
4. Route files for API endpoints