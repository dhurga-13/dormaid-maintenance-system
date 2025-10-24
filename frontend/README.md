# DormAid - Dormitory Maintenance Management System

A complete full-stack web application for managing maintenance requests in university dormitories. Built with React.js frontend and Node.js backend with SQLite database.

## QUICK START

1. Clone Repository:
   git clone https://github.com/dhurga-13/dormaid-maintenance-system.git
   cd dormaid-maintenance-system

2. Setup Backend:
   cd backend
   npm install
   Create .env file with:
     PORT=5000
     JWT_SECRET=your_jwt_secret_here
     DATABASE_PATH=./dormaid.sqlite
   npm start

3. Setup Frontend (new terminal):
   cd frontend
   npm install
   npm run dev

4. Access:
   Frontend: http://localhost:5173
   Backend: http://localhost:5000

## PROJECT STRUCTURE

dormaid-maintenance-system/
├── frontend/                 # React application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Profile.js
│   │   │   └── ...
│   │   ├── context/         # Context providers
│   │   │   └── AuthContext.js
│   │   ├── App.js          # Main App component
│   │   └── index.js        # Entry point
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Node.js API
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   ├── database.js          # Database configuration
│   ├── server.js           # Server entry point
│   └── package.json
├── README.md
└── .gitignore

## FEATURES

- Multi-role authentication (Student, Technician, Admin)
- JWT-based secure login
- Profile management with real-time updates
- Maintenance request creation and tracking
- Priority-based categorization (Low, Medium, High)
- Technician assignment system
- Role-based dashboards

## USER ROLES

1. Student: Submit and track personal requests
2. Technician: Accept and complete assigned requests
3. Admin: Full system access and user management

## API ENDPOINTS

AUTHENTICATION:
POST /api/auth/register - User registration
POST /api/auth/login - User login
GET /api/auth/profile - Get user profile
PUT /api/auth/profile - Update user profile
POST /api/auth/change-password - Change password

MAINTENANCE:
GET /api/maintenance - Get all requests
POST /api/maintenance - Create new request
PUT /api/maintenance/:id - Update request
DELETE /api/maintenance/:id - Delete request
PUT /api/maintenance/:id/assign - Assign technician

## DATABASE SCHEMA

USERS TABLE:
- id (Primary Key)
- username, email, password_hash
- role (student/technician/admin)
- room_number, phone
- created_at, updated_at

MAINTENANCE_REQUESTS TABLE:
- id (Primary Key)
- user_id (Foreign Key)
- title, description, room_number
- status, priority
- assigned_to (Foreign Key to Users)
- created_at, updated_at

## DEVELOPMENT COMMANDS

BACKEND:
cd backend
npm start          # Start server
npm run dev        # Start with nodemon (if configured)

FRONTEND:
cd frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build

## TROUBLESHOOTING

1. Port already in use:
   - Backend: Change PORT in backend/.env
   - Frontend: Change port in frontend/vite.config.js

2. Database issues:
   - Ensure SQLite can create database files
   - Check file permissions

3. CORS errors:
   - Ensure backend runs on port 5000
   - Check frontend proxy in vite.config.js

4. Dependencies issues:
   npm cache clean --force
   rm -rf node_modules
   npm install

## ENVIRONMENT SETUP

Backend .env file required:
PORT=5000
JWT_SECRET=your_jwt_secret_here_change_in_production
DATABASE_PATH=./dormaid.sqlite
NODE_ENV=development

## TECHNOLOGIES USED

Frontend:
- React.js 18
- Vite build tool
- Context API for state management
- CSS3 for styling

Backend:
- Node.js
- Express.js
- SQLite database
- JWT authentication
- CORS middleware

## KNOWN ISSUES

- Email service not integrated (OTP uses console logs)
- File upload not implemented
- Real-time notifications pending
- Password reset functionality needed

## CONTRIBUTING

1. Fork repository
2. Create feature branch: git checkout -b feature/new-feature
3. Commit changes: git commit -m 'Add new feature'
4. Push to branch: git push origin feature/new-feature
5. Open Pull Request

## SUPPORT

For issues:
1. Check troubleshooting section
2. Ensure all dependencies installed
3. Verify environment variables
4. Check console for error messages

## LICENSE

MIT License - free for educational and development use.

## DEVELOPER NOTES

- Database auto-initializes on first run
- Default users can be created through registration
- Frontend proxies API calls to backend automatically
- JWT tokens stored in localStorage

This is a production-ready foundation for a maintenance management system with complete authentication and CRUD operations.
