# Rule-Based Workflow Engine

A powerful full-stack workflow automation system built with React, Node.js, and MongoDB that enables businesses to create, manage, and execute rule-based workflows with approval chains and notifications.

## Video Demo
Watch the demonstration video here: [https://youtu.be/GMWI8wJqz-c](https://youtu.be/GMWI8wJqz-c)

## Features

### Core Workflow Management
- **Visual Workflow Builder**: Create and edit complex workflows with drag-and-drop simplicity
- **Rule Engine**: Advanced rule evaluation with priority-based routing
- **Step Types**: Support for Task, Approval, and Notification steps
- **Dynamic Routing**: Conditional workflow paths based on business rules

### Rule Engine Capabilities
- **Operators**: `==`, `!=`, `<`, `>`, `<=`, `>=`, `&&`, `||`
- **Functions**: `contains()`, `startsWith()`, `endsWith()`
- **Priority Management**: Automatic sequential rule prioritization
- **Default Rules**: Fallback routing options

### User Management & Security
- **Role-Based Access Control**: Admin, Manager, Finance, CEO, Developer roles
- **Approval Workflows**: Multi-level approval chains with role-based assignments
- **Authentication**: Secure user authentication and authorization

### Execution & Monitoring
- **Real-time Execution**: Live workflow execution monitoring
- **Detailed Logging**: Comprehensive execution logs with step-by-step tracking
- **Audit Trail**: Complete audit history for compliance
- **Error Handling**: Robust error recovery and retry mechanisms

### Notifications
- **Targeted Notifications**: Send notifications to specific users or roles
- **Multiple Channels**: Email and Slack integration
- **Approval Alerts**: Automatic notifications for pending approvals

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - Modern UI framework
- **Vite 5.2.8** - Fast build tool
- **Tailwind CSS 3.4.3** - Utility-first CSS framework
- **Heroicons** - Beautiful icon library
- **React Router 7.13.1** - Client-side routing
- **Axios 1.6.8** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express 4.18.2** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 8.0.3** - MongoDB object modeling
- **JWT 9.0.2** - Authentication tokens
- **Bcryptjs 2.4.3** - Password hashing

## 📋 Prerequisites

- Node.js 16+ installed
- MongoDB running on `mongodb://localhost:27017`
- Git for version control

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Shanmugapriya52/Shanmugapriya52-rule-based-workflow-engine.git
cd rule-based-workflow-engine
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the backend directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/halleyx-workflow

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# CORS
FRONTEND_URL=http://localhost:5173

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Redis (Optional)
REDIS_URL=redis://localhost:6379
```

### 4. Start Backend Server
```bash
npm start
# or for development
npm run dev
```

### 5. Frontend Setup
```bash
cd ../frontend
npm install
```

### 6. Start Frontend Development Server
```bash
npm run dev
```

### 7. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

## Default Credentials

After starting the application, you can use these default credentials:

- **Admin**: username: `admin`, password: `admin123`
- **Manager**: username: `manager`, password: `manager123`
- **Finance**: username: `finance`, password: `finance123`

## Usage Guide

### Creating a Workflow

1. **Login** as an admin user
2. Navigate to **Workflow List** → **Create Workflow**
3. **Define Input Schema** (e.g., amount: number, country: string, priority: enum)
4. **Add Steps** to your workflow:
   - **Task Steps**: Manual or automated tasks
   - **Approval Steps**: Require user approval with role assignment
   - **Notification Steps**: Send alerts to users
5. **Configure Rules** for each step to define routing logic
6. **Save and Activate** the workflow

### Setting Up Rules

Rules use JavaScript-like syntax:
```javascript
// Simple condition
amount > 1000

// Complex condition with multiple operators
amount > 1000 && country == "USA"

// Using string functions
contains(email, "@company.com") && priority == "High"

// Default rule (always matches if reached)
DEFAULT
```

### Executing Workflows

1. Go to **Workflow List** → **Execute** on any workflow
2. **Provide Input Data** according to the workflow schema
3. **Monitor Execution** in real-time
4. **Handle Approvals** if workflow requires approval
5. **View Logs** for detailed execution history

## Project Structure

```
workflow-engine/
├── backend/
│   ├── models/          # MongoDB models (Workflow, Step, Rule, Execution)
│   ├── routes/          # API routes for all endpoints
│   ├── utils/           # Utility functions (RuleEngine, SchemaValidator)
│   ├── config/          # Database configuration
│   └── server.js        # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Page components (Dashboard, Workflows, etc.)
│   │   ├── services/    # API services and utilities
│   │   └── styles/      # CSS and styling
│   └── public/          # Static assets
└── README.md
```

## 🔧 API Endpoints

### Workflows
- `GET /api/workflows` - List all workflows
- `POST /api/workflows` - Create new workflow
- `GET /api/workflows/:id` - Get workflow details
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

### Steps
- `GET /api/workflows/:workflowId/steps` - List workflow steps
- `POST /api/workflows/:workflowId/steps` - Create step
- `PUT /api/steps/:id` - Update step
- `DELETE /api/steps/:id` - Delete step

### Rules
- `GET /api/steps/:stepId/rules` - List step rules
- `POST /api/steps/:stepId/rules` - Create rule
- `PUT /api/rules/:id` - Update rule
- `DELETE /api/rules/:id` - Delete rule

### Executions
- `POST /api/workflows/:workflowId/execute` - Execute workflow
- `GET /api/executions/:id` - Get execution details
- `POST /api/executions/:id/cancel` - Cancel execution
- `POST /api/executions/:id/retry` - Retry failed execution

## Key Features Explained

### Rule Engine
The rule engine evaluates conditions in priority order (1, 2, 3...) and stops at the first match. This ensures predictable workflow routing.

### Approval Steps
- Assign to specific users or entire roles
- Pause workflow execution until approval
- Support for approve/reject decisions
- Automatic notifications to approvers

### Execution Logging
Every step generates detailed logs including:
- Step name and type
- Evaluated rules and results
- Selected next step
- Execution status and timestamps
- Error messages (if any)

### Input Schema Validation
Workflows enforce input data validation:
```javascript
{
  amount: "number",
  country: "string", 
  priority: "enum(High,Medium,Low)"
}
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running on `localhost:27017`
   - Check the MONGODB_URI in your .env file

2. **CORS Errors**
   - Verify FRONTEND_URL in .env matches your frontend URL
   - Default should be `http://localhost:5173`

3. **Authentication Issues**
   - Clear browser localStorage and login again
   - Check JWT_SECRET is set in .env

4. **Workflow Execution Fails**
   - Check input schema validation
   - Verify all steps have proper rules configured
   - Review execution logs for detailed errors

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the existing documentation and troubleshooting guide

## 🎉 Acknowledgments

- Built for the Halleyx Challenge
- Thanks to the open-source community for the amazing tools and libraries
- Special thanks to React, Node.js, and MongoDB ecosystems

---

**Built with ❤️ by Shanmugapriya52**
